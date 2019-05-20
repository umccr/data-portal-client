import React, { Component, Fragment } from 'react';
import { API } from 'aws-amplify';
import { Sunburst } from '../lib';
import { SizeMe } from 'react-sizeme';
import { withStyles } from '@material-ui/core';
import * as PropTypes from 'prop-types';

const styles = theme => ({
    chartContainer: {
        height: '100%',
    },
});

const getOrCreateChild = (node, subPath) => {
    // Get or create children list
    if (!('children' in node)) {
        node.children = [];
    }

    // Filter the child with name same as sub path
    const filtered = node.children.filter(c => c.name === subPath);
    let child;

    // Create a new child if there doesn't exist
    if (filtered.length === 0) {
        child = {
            name: subPath,
            size: 0,
        };
        node.children.push(child);
    } else {
        // We should get only one matching child
        child = filtered[0];
    }

    return child;
};

class Explore extends Component {
    state = {
        data: null,
    };

    async componentDidMount() {
        const data = await API.get(
            'files',
            '/files?query=&randomSamples=200',
            {},
        );

        const { dataRows } = data.rows;

        // Define the root node first
        const rootNode = {
            name: 'All Files',
            children: [],
        };

        dataRows.forEach(d => {
            // Get and split the file path into sub paths
            const filePath = d[2];
            const tokens = filePath.split('/');
            let parentNode = rootNode;

            // Traverse through each sub path
            tokens.forEach((t, depth) => {
                const subPath = t;

                // Check if we have reached the max depth
                // We just increment child count for the parent node
                if (depth >= 3) {
                    parentNode.size += 1;
                    return;
                }

                const child = getOrCreateChild(parentNode, subPath);

                // Ignore root note
                if (parentNode !== rootNode) {
                    parentNode.size += 1;
                }

                // Let the parent node for next sub path be this new child
                parentNode = child;
            });
        });

        this.setState({
            data: rootNode,
        });
    }

    render() {
        const { data } = this.state;
        const { classes } = this.props;

        return (
            <div>
                <div className={classes.chartContainer}>
                    {data && <Sunburst data={data} />}
                </div>
            </div>
        );
    }
}

Explore.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Explore);
