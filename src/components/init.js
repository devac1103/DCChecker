import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Actions, Scene, Router } from 'react-native-router-flux';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AuthAction from '../actions/auth';
import { Colors } from '../lib/device-info';

import Spinner from 'react-native-spinkit';

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

class Init extends Component {
    componentDidMount() {
        setTimeout(() => {
            Actions.main();
        }, 2000);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.spinnerArea}>
                    <Spinner
                        style={styles.spinner}
                        isVisible={true}
                        size={100}
                        type='Bounce'
                        color={Colors.brightGreyColor}
                    />
                </View>
                <Text style={styles.textLogo}>DC Checker</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    spinnerArea: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textLogo: {
        fontSize: 36,
        color: 'black',
        fontWeight: '900',
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Init);
