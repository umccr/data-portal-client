import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Provider from 'react-redux/lib/components/Provider';
import { applyMiddleware, createStore } from 'redux';
import reducer from './reducers';
import thunk from 'redux-thunk';
import { BrowserRouter as Router } from 'react-router-dom';

const store = createStore(reducer, applyMiddleware(thunk));

//TODO need to setup test framework, skip for now

// eslint-disable-next-line no-undef
xit('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
