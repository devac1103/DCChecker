import React, { Component } from 'react';
import { Router, Reducer, Scene } from 'react-native-router-flux';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as AuthAction from './actions/auth';

import Init from './components/init';
import Main from './components/main';

// map redux store to props
function mapStateToProps(state) {
    return {
        auth: state.auth,
    }
}

// map actions to props
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            Auth: bindActionCreators(AuthAction, dispatch),
        }
    }
}

const reducerCreate = params => {
    const defaultReducer = Reducer(params);

    return (state, action) => {
        console.log("ROUTER ACTION: ", action);
        return defaultReducer(state, action);
    }
}


export default class UnitConverter extends Component {
    render() {
        return(
            <Router createReducer={reducerCreate}>
                <Scene key="root">
                    <Scene key="init" component={Init} hideNavBar={true} title="Init" initial />
                    <Scene key="main" component={Main} hideNavBar={true} title="Main" />
                </Scene>
            </Router>
        );
    }
}
