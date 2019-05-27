import React, { Component, Fragment } from 'react';
import { API } from 'aws-amplify';
import { Sunburst } from '../lib';
import { withStyles } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {
    CartesianGrid,
    Label,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
    ZAxis,
} from 'recharts';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import BubbleChartToolTip from './BubbleChartToolTip';
import * as ColorString from 'color-string';

const styles = theme => ({
    chartContainer: {
        height: '100%',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    },
});

/**
 * Given the parent node and its sub path string, construct a new child node
 * under the parent node.
 * @returns {{depth: *, name: *}}
 */
const getOrCreateChild = (parentNode, subPath, fullPath) => {
    // Get or create children list
    if (!('children' in parentNode)) {
        parentNode.children = [];
    }

    // Filter the child with name same as sub path
    const filtered = parentNode.children.filter(c => c.name === subPath);
    let child;

    // Create a new child if there doesn't exist
    if (filtered.length === 0) {
        child = {
            name: subPath,
            depth: parentNode.depth + 1,
            fullPath,
        };
        parentNode.children.push(child);
    } else {
        // We should get only one matching child
        child = filtered[0];
    }

    return child;
};

class Explore extends Component {
    state = {
        dataRows: [],
        selectedPath: [],
        maximumDepth: 3,
    };

    async componentDidMount() {
        const data = await API.get(
            'files',
            '/files?query=&randomSamples=200',
            {},
        );

        const { dataRows } = data.rows;

        this.setState(
            {
                dataRows,
            },
            () => {
                this.processDataRows();
            },
        );
    }

    /**
     * The generic method to traverse the tree
     * @param node the node to starts from
     * @param action the action to be performed on a node
     */
    traverseTree = (node, action) => {
        action(node);

        if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                // Recursively traverse the tree
                this.traverseTree(node.children[i], action);
            }
        }
    };

    /**
     * Format every node to provide the extra information needed for other rendering
     */
    formatNodes = (rootNode, totalRecords) => {
        this.traverseTree(rootNode, node => {
            // Weight is the percentage of #descending nodes in #total records
            node.weight = ((node.size / totalRecords) * 100).toFixed(2);

            let childrenCount = 0;
            this.traverseTree(node, () => (childrenCount += 1));
            node.childrenCount = childrenCount;

            // Generate a random colour for this node
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            node.color = `rgba(${r},${g},${b}, ${0.8})`;
        });
    };

    /**
     * When
     * @param newProps
     */
    handleSelectedPathChange = newProps => {
        console.log(newProps);
        this.setState(
            {
                ...this.state,
                ...newProps,
            },
            () => this.processDataRows(true),
        );
    };

    /**
     * Given the root node and all data rows, construct the complete tree
     * @param maximumDepth depth of any tree branch will not exceed this max val
     */
    computeTree = (rootNode, dataRows, maximumDepth) => {
        dataRows.forEach(d => {
            // Get and split the file path into sub paths
            const filePath = d[2];
            const tokens = filePath.split('/');
            let parentNode = rootNode;

            // Traverse through each sub path
            tokens.forEach((t, depth) => {
                const subPath = t;

                // Check if we have reached the max depth
                if (depth >= maximumDepth) {
                    return;
                }

                const fullPath = tokens.slice(0, depth + 1).join('/');
                const child = getOrCreateChild(parentNode, subPath, fullPath);

                // Calculate the size using data rows
                child.size = dataRows.filter(d =>
                    d[2].includes(fullPath),
                ).length;

                // Let the parent node for next sub path be this new child
                parentNode = child;
            });
        });
    };

    /**
     * Convert data rows into tree and denormalised data
     * @param updateNormalisedDataOnly whether we only want to update the normalised data
     */
    processDataRows = (updateNormalisedDataOnly = false) => {
        const { dataRows, maximumDepth } = this.state;

        if (dataRows === null) {
            return {};
        }

        let rootNode;

        if (!updateNormalisedDataOnly) {
            // Define the root node first
            rootNode = {
                name: 'All Files',
                children: [],
                depth: 0,
                size: dataRows.length,
            };

            this.computeTree(rootNode, dataRows, maximumDepth);
            this.formatNodes(rootNode, dataRows.length);
        } else {
            rootNode = this.state.treeData;
        }

        const denormalisedData = [];

        this.denormaliseTree(rootNode, denormalisedData);

        this.setState({
            treeData: rootNode,
            denormalisedData,
        });
    };

    /**
     * Denormalise the tree into a plain array containing all nocdes
     * @param dataArray will save nodes into this data array
     */
    denormaliseTree = (rootNode, dataArray) => {
        const { selectedPath } = this.state;

        this.traverseTree(rootNode, currNode => {
            // Ignore root node
            if (currNode.depth === 0) {
                return;
            }

            let color = currNode.color;

            if (selectedPath && selectedPath.length > 0) {
                if (!currNode.fullPath.includes(selectedPath.join('/'))) {
                    // Grey out the node if it is not in the current sunburst chart view
                    color = `rgb(200,200,200,0.5)`;
                }
            }

            dataArray.push({
                name: currNode.name,
                weight: currNode.weight,
                depth: currNode.depth,
                color: color,
                childrenCount: currNode.childrenCount,
                fullPath: currNode.fullPath,
            });
        });

        this.setState({
            maxWeight: Math.max.apply(Math, dataArray.map(d => d.weight)),
        });
    };

    /**
     * When max depth change, refresh the tree as well as normalised data
     */
    handleMaxDepthChange = event => {
        this.setState(
            {
                maximumDepth: event.target.value,
            },
            () => {
                this.processDataRows();
            },
        );
    };

    renderBubbleChart = () => {
        const { denormalisedData, maxWeight } = this.state;

        return (
            <ResponsiveContainer width="100%" height={600}>
                <ScatterChart
                    height={550}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                    }}
                >
                    <CartesianGrid />
                    <XAxis
                        type="number"
                        dataKey="childrenCount"
                        name="Total Nodes"
                        allowDecimals={false}
                    >
                        <Label
                            value="Total Nodes"
                            offset={-10}
                            position="insideBottom"
                        />
                    </XAxis>
                    <YAxis
                        type="number"
                        dataKey="weight"
                        allowDecimals={false}
                        // Give some stretch space for higher bubbldes
                        domain={[0, Math.floor(maxWeight * 1.2)]}
                    >
                        <Label
                            value="Total Size (%)"
                            angle={-90}
                            position="insideLeft"
                        />
                    </YAxis>
                    <ZAxis
                        type="number"
                        dataKey="weight"
                        name="Total Size"
                        range={[0, 1000]}
                        unit="%"
                    />
                    <Tooltip
                        cursor={{
                            strokeDasharray: '3 3',
                        }}
                        content={<BubbleChartToolTip />}
                    />
                    {denormalisedData.map(d => (
                        <Scatter
                            key={d.name}
                            name={d.name}
                            data={[d]}
                            fill={d.color}
                        />
                    ))}
                </ScatterChart>
            </ResponsiveContainer>
        );
    };

    handleArcMouseAction = (action, node, d) => {
        let opacity;

        if (action === 'mouseenter') {
            opacity = 0.5;
        } else if (action === 'mouseleave') {
            opacity = 1;
        }

        // Adjust current arc's opacity
        d.attr('opacity', opacity);
    };

    render() {
        const { selectedPath } = this.state;
        const { classes } = this.props;
        const { treeData } = this.state;

        return (
            <Grid className={classes.chartContainer} container>
                {treeData === undefined && (
                    <CircularProgress className={classes.progress} />
                )}
                {treeData && (
                    <Fragment>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl}>
                                <InputLabel>Maximum Depth</InputLabel>
                                <Select
                                    value={this.state.maximumDepth}
                                    onChange={this.handleMaxDepthChange}
                                >
                                    <MenuItem value={1}>Level 1</MenuItem>
                                    <MenuItem value={2}>Level 2</MenuItem>
                                    <MenuItem value={3}>Level 3</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs>
                            <Sunburst
                                data={treeData}
                                selectedPath={selectedPath}
                                setProps={this.handleSelectedPathChange}
                                handleArcMouseAction={this.handleArcMouseAction}
                            />
                        </Grid>
                        <Grid item xs>
                            {this.renderBubbleChart()}
                        </Grid>
                    </Fragment>
                )}
            </Grid>
        );
    }
}

Explore.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Explore);
