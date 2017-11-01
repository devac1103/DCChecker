import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    BackHandler,
    Text,
    TouchableOpacity,
    View,
    Alert,
    processColor,
    ScrollView,
    NativeModules,
    DeviceEventEmitter,
} from 'react-native';
import update from 'immutability-helper';

import { Actions, Scene, Router } from 'react-native-router-flux';
import { Colors, Device, FontSize } from '../lib/device-info';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AuthAction from '../actions/auth';
import _ from 'lodash';

import { LineChart } from '../widgets/charts';
import { captureScreen } from "react-native-view-shot";
import RNFS  from 'react-native-fs';

const { Gyroscope: GyroNative, Accelerometer: AccNative } = NativeModules;
const handle = {
  Accelerometer: AccNative,
  Gyroscope: GyroNative,
};

const RNSensors = {
  start: function (type, updateInterval) {
    const api = handle[type];
    api.setUpdateInterval(updateInterval);
    return api.startUpdates();
  },

  stop: function (type) {
    const api = handle[type];
    api.stopUpdates();
  },
};

let mockSize = 60,
    mockData = [],
    minMockData = [],
    maxMockData = [],
    trackMockData = [],
    minTrackMockData = [],
    maxTrackMockData = [],
    trackData = [],
    vx = 0,
    vy = 0,
    sx = 0,
    sy = 0,
    s = 0,
    v = 0;

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

class Check extends Component {

    constructor(props) {
        super(props);

        this.state = {
            safeState: 0,
            isCompleteView: false,
            isStarted: false,
            isStoppable: false,
            isContinuable: false,
            isReset: false,
            completeViewData: {},
            trackViewData: {},
            legend: {
                enabled: true,
                textColor: processColor('red'),
                textSize: 12,
                position: 'BELOW_CHART_RIGHT',
                form: 'SQUARE',
                formSize: 14,
                xEntrSpace: 10,
                yEntrySpace: 5,
                formToTextSpace: 5,
                wordWrapEnabled: true,
                maxSizePercent: 0.5,
                custom: {
                    colors: [processColor('red')],
                    labels: ['REFER']
                }
            },
            marker: {
                enabled: true,
                markerColor: processColor('#F0C0FF8C'),
                textColor: processColor('white'),
                markerFontSize: 14,
            },
            selectedEntry: '',
            startTrackingPoint: 0,
            initialCount: 0,
        };
    }

    componentDidMount() {
        this.initializeGraph();      
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    initializeGraph() {
        mockData = [], trackMockData = [], trackData = [], minMockData = [], maxMockData = [];

        this.setState({
            headerText: 'Driving Cycle Checker',
            startTrackingPoint: 0,
            initialCount: 0,
            isStarted: false,
            isContinuable: false,
            isStoppable: false,
        });

        _.map(this.props.browseData, (item) => {
            mockData.push(Number(item));
            if (this.props.tolerenceOption == 0) {
                minMockData.push(Number(item) * 0.9);
                maxMockData.push(Number(item) * 1.1);
            } else {
                minMockData.push((Number(item) > 10) ? (Number(item) - 10) : 0);
                maxMockData.push(Number(item) + 10);
            }
        });
        trackMockData = mockData.slice(0, mockSize / 2);
        minTrackMockData = minMockData.slice(0, mockSize / 2);
        maxTrackMockData = maxMockData.slice(0, mockSize / 2);

        this.setState(
          update(this.state, {
            completeViewData: {
                $set: {
                    dataSets: [{
                        values: mockData,
                        label: 'Company X',
                        config: {
                            lineWidth: 2,
                            drawCircles: false,
                            drawCubicIntensity: 0.4,
                            circleRadius: 5,
                            circleColor: processColor('blue'),
                            highlightColor: processColor('red'),
                            color: processColor('red'),
                            drawFilled: true,
                            fillColor: processColor('red'),
                            fillAlpha: 60,
                            valueTextSize: 15,
                            valueFormatter: "##.000",
                        }
                    }],
                }
            },
            xAxis: {
              $set: {
                valueFormatter: ['Q1', 'Q2', 'Q3', 'Q4']
              }
            },
            trackViewData: {
                $set: {
                    dataSets: [{
                        values: trackMockData,
                        label: 'Company X',
                        config: {
                            lineWidth: 2,
                            drawCircles: false,
                            drawCubicIntensity: 0.4,
                            circleRadius: 5,
                            circleColor: processColor('blue'),
                            highlightColor: processColor('red'),
                            color: processColor('red'),
                            drawFilled: true,
                            fillColor: processColor('red'),
                            fillAlpha: 0,
                            valueTextSize: 0,
                        }
                    },{
                        values: minTrackMockData,
                        label: 'Company X',
                        config: {
                            lineWidth: 2,
                            drawCircles: false,
                            drawCubicIntensity: 0.4,
                            circleRadius: 5,
                            circleColor: processColor('blue'),
                            highlightColor: processColor('blue'),
                            color: processColor('blue'),
                            drawFilled: true,
                            fillColor: processColor('blue'),
                            fillAlpha: 0,
                            valueTextSize: 0,
                        }
                    },{
                        values: maxTrackMockData,
                        label: 'Company X',
                        config: {
                            lineWidth: 2,
                            drawCircles: false,
                            drawCubicIntensity: 0.4,
                            circleRadius: 5,
                            circleColor: processColor('blue'),
                            highlightColor: processColor('blue'),
                            color: processColor('blue'),
                            drawFilled: true,
                            fillColor: processColor('blue'),
                            fillAlpha: 0,
                            valueTextSize: 0,
                        }
                    }],
                }
            },
          })
        );
    }

    handleSelect(event) {
        let entry = event.nativeEvent
        if (entry == null) {
            this.setState({...this.state, selectedEntry: null})
        } else {
            this.setState({...this.state, selectedEntry: JSON.stringify(entry)})
        }
    }

    startSensor() {
        RNSensors.start('Accelerometer', 1000).then(() => {
            DeviceEventEmitter.addListener('Accelerometer', function(data) {
                let accelerationX = data.x;
                let accelerationY = data.y;
                let accelerationZ = data.z;
                vx = vx + accelerationX;
                vy = vy + accelerationY;
                v = Math.sqrt((Math.pow(vx, 2) + Math.pow(vy, 2))) * 3600 / 1000;
                // console.log('-------', v);
            });
        }, (error) => {
            console.log(error)
        });
    }

    stopSensor() {
        RNSensors.stop('Accelerometer');
    }

    updateValue() {

        if (this.state.initialCount < mockSize / 2) {
            this.setState({
                initialCount: this.state.initialCount + 1,
            });
            trackMockData = mockData.slice(0, this.state.initialCount + mockSize / 2);
            minTrackMockData = minMockData.slice(0, this.state.initialCount + mockSize / 2);
            maxTrackMockData = maxMockData.slice(0, this.state.initialCount + mockSize / 2);
            trackData = _.concat(trackData, v);
        } else {
            this.setState({
                startTrackingPoint: this.state.startTrackingPoint + 1,
            });
            if (this.state.startTrackingPoint > mockData.length - mockSize)
                clearInterval(this.interval);
            trackMockData = mockData.slice(this.state.startTrackingPoint, this.state.startTrackingPoint + mockSize);
            minTrackMockData = minMockData.slice(this.state.startTrackingPoint, this.state.startTrackingPoint + mockSize);
            maxTrackMockData = maxMockData.slice(this.state.startTrackingPoint, this.state.startTrackingPoint + mockSize);
            trackData = _.concat(trackData.slice(1, mockSize / 2), v);
        }

        if (this.state.isStarted) {
            this.setState({
                contentHeaderText: `Reference: ${Math.round(trackMockData[mockSize/2] * 10) / 10.0}km/h - Progress: ${Math.round(this.state.startTrackingPoint * 100 / mockData.length) * 100 / 100}%`,
            });
        }

        if ((trackMockData[mockSize/2] - v) * 100 / trackMockData[mockSize/2] > 10) {
            this.setState({
                headerText: `${Math.round(v * 10) / 10.0}km/h - more than 10%`,
                safeState: 2,
            })
        } else {
            this.setState({
                headerText: `${Math.round(v * 10) / 10.0}km/h - deviation below 10%`,
                safeState: 1,
            })
        }

        this.setState(
          update(this.state, {
            trackViewData: {
              $set: {
                dataSets: [{
                  values: trackMockData,
                  label: 'Company X',
                  config: {
                    lineWidth: 2,
                    drawCircles: false,
                    drawCubicIntensity: 0.4,
                    circleRadius: 5,
                    circleColor: processColor('blue'),
                    highlightColor: processColor('red'),
                    color: processColor('red'),
                    drawFilled: true,
                    fillColor: processColor('red'),
                    fillAlpha: 0,
                    valueTextSize: 0,
                  }
                },{
                  values: minTrackMockData,
                  label: 'Company X',
                  config: {
                    lineWidth: 2,
                    drawCircles: false,
                    drawCubicIntensity: 0.4,
                    circleRadius: 5,
                    circleColor: processColor('blue'),
                    highlightColor: processColor('blue'),
                    color: processColor('blue'),
                    drawFilled: true,
                    fillColor: processColor('blue'),
                    fillAlpha: 0,
                    valueTextSize: 0,
                  }
                },{
                  values: maxTrackMockData,
                  label: 'Company X',
                  config: {
                    lineWidth: 2,
                    drawCircles: false,
                    drawCubicIntensity: 0.4,
                    circleRadius: 5,
                    circleColor: processColor('blue'),
                    highlightColor: processColor('blue'),
                    color: processColor('blue'),
                    drawFilled: true,
                    fillColor: processColor('blue'),
                    fillAlpha: 0,
                    valueTextSize: 0,
                  }
                }, {
                    values: trackData,
                    label: 'Company Y',
                    config: {
                        lineWidth: 4,
                        drawCubicIntensity: 0.4,
                        drawCircles: false,
                        circleRadius: 5,
                        drawHighlightIndicators: false,
                        color: processColor('green'),
                        drawFilled: true,
                        fillColor: processColor('green'),
                        fillAlpha: 0,
                        circleColor: processColor('green'),
                        valueTextSize: 0,
                    }
                }],
              }
            }
        }));
    }

    startTrack() {
        if (!this.state.isStarted) {
            this.startSensor();
            this.interval = setInterval(() => this.updateValue(), 200);
            this.setState({
                isStarted: true,
                isStoppable: true,
            });
        } else if (this.state.isStarted && this.state.isContinuable) {
            this.startSensor();
            this.interval = setInterval(() => this.updateValue(), 200);
            this.setState({
                isStoppable: true,
                isContinuable: false,
            });
        } else if (this.state.isStarted && this.state.isStoppable) {
            clearInterval(this.interval);
            this.stopSensor();
            this.setState({
                isContinuable: true,
                isStoppable: false,
            });
        }
    }

    onStartClicked() {
        let startToggle = '';
        let toggleMessage = '';

        if (!this.state.isStarted) {
            startToggle = 'Start';
            toggleMessage = 'Are you sure you are going to start tracking?';
        } else if (this.state.isStarted && this.state.isContinuable) {
            startToggle = 'Continue';
            toggleMessage = 'Are you sure you are going to continue tracking?';
        } else if (this.state.isStarted && this.state.isStoppable) {
            startToggle = 'Stop';
            toggleMessage = 'Are you sure you are going to stop stracking?'
        }

        Alert.alert(
            'Track Confirmation',
            toggleMessage,
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                {text: 'OK', onPress: () => this.startTrack()}
            ]
        );
    }

    resetTrack() {
        clearInterval(this.interval);
        this.setState({
                isReset: true,
                isStarted: false,
                isStoppable: false,
                isContinuable: false,
        }, () => {
            this.initializeGraph();
        });
    }

    onResetClicked() {
        let alertMessage = 'Are you sure you are going to reset tracking?';

        Alert.alert(
            'Track Confirmation',
            alertMessage,
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                {text: 'OK', onPress: () => this.resetTrack()}
            ]
        );
    }

    onCompleteViewClicked() {
        this.setState({
            isCompleteView: !this.state.isCompleteView,
        });
    }

    onBackClicked() {
        let alertMessage = 'Are you sure you are going to back to main screen?';

        Alert.alert(
            'Track Confirmation',
            alertMessage,
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                {text: 'OK', onPress: () => Actions.main()}
            ]
        );
    }

    onQuitClicked() {
        let alertMessage = 'Are you sure you are going to quit the app?';

        Alert.alert(
            'Track Confirmation',
            alertMessage,
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                {text: 'OK', onPress: () => BackHandler.exitApp()}
            ]
        );
    }

    onExportIMGClicked() {
        let alertMessage = 'Are you sure you are going to export image?';

        Alert.alert(
            'Export Confirmation',
            alertMessage,
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                {text: 'OK', onPress: () => this.captureImage()}
            ]
        );
    }

    captureImage() {

        captureScreen({
            format: "jpg",
            quality: 0.8
        })
        .then(
            uri => console.log("Image saved to", uri),
            error => console.error("Oops, snapshot failed", error)
        );
    }

    onExportCSVClicked() {
        let alertMessage = 'Are you sure you are going to export CSV?';

        Alert.alert(
            'Export Confirmation',
            alertMessage,
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')},
                {text: 'OK', onPress: () => this.exportCSV()}
            ]
        );
    }

    exportCSV() {
        let writeData = mockData.length ? (mockData.join(",")) : '';

        // create a path you want to write to
        let path = RNFS.DocumentDirectoryPath + '/my-file.csv';

        // write the file
        RNFS.writeFile(path, writeData, 'utf8')
          .then((success) => {
            console.log('FILE WRITTEN!');
          })
          .catch((err) => {
            console.log(err.message);
          });
    }

    render() {

        return (
            <View style={styles.container}>
                {
                    (this.state.safeState == 0) &&
                    <View style={styles.header}>
                        <Text style={styles.headerText, {color: 'white', fontSize: 34}}>
                            {this.state.headerText}
                        </Text>
                    </View>
                }
                {
                    (this.state.safeState == 1) &&
                    <View style={styles.header}>
                        <Text style={styles.headerText, {color: 'green', fontSize: 34}}>
                            {this.state.headerText}
                        </Text>
                    </View>
                }
                {
                    (this.state.safeState == 2) &&
                    <View style={styles.header}>
                        <Text style={styles.headerText, {color: 'red', fontSize: 34}}>
                            {this.state.headerText}
                        </Text>
                    </View>
                }
                <View style={styles.content}>
                    <View style={styles.contentHeader}>
                        <Text style={styles.contentHeaderText}>{this.state.contentHeaderText}</Text>
                        {
                            (this.state.isCompleteView) &&
                            <View style={{width: Device.width, flexDirection: 'row', paddingLeft: 10}}>
                                <TouchableOpacity onPress={() => this.onExportCSVClicked()}>
                                    <Text style={{color: 'green', fontSize: 16, fontWeight: '900', marginRight: 10}}>Export CSV</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.onExportIMGClicked()}>
                                    <Text style={{color: 'red', fontSize: 16, fontWeight: '900'}}>Export IMG</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                    <View style={styles.contentBody}>
                        <View style={styles.graphArea}>
                        {
                            (this.state.isCompleteView) ?
                            <View style={styles.completeView}>
                                <LineChart
                                    style={styles.chart}
                                    data={this.state.completeViewData}
                                    description={{text: ''}}
                                    legend={this.state.legend}
                                    marker={this.state.marker}
                                    xAxis={this.state.xAxis}
                                    drawGridBackground={false}
                                    borderColor={processColor('teal')}
                                    borderWidth={1}
                                    drawBorders={true}

                                    touchEnabled={true}
                                    dragEnabled={true}
                                    scaleEnabled={true}
                                    scaleXEnabled={true}
                                    scaleYEnabled={true}
                                    pinchZoom={true}
                                    doubleTapToZoomEnabled={true}

                                    dragDecelerationEnabled={true}
                                    dragDecelerationFrictionCoef={0.99}

                                    keepPositionOnRotation={false}
                                    onSelect={this.handleSelect.bind(this)}
                                  />
                            </View> :
                            <View style={styles.trackView}>
                                <LineChart
                                    style={styles.chart}
                                    data={this.state.trackViewData}
                                    description={{text: ''}}
                                    legend={this.state.legend}
                                    marker={this.state.marker}
                                    xAxis={this.state.xAxis}
                                    drawGridBackground={false}
                                    borderColor={processColor('teal')}
                                    borderWidth={1}
                                    drawBorders={true}

                                    touchEnabled={true}
                                    dragEnabled={true}
                                    scaleEnabled={true}
                                    scaleXEnabled={true}
                                    scaleYEnabled={true}
                                    pinchZoom={true}
                                    doubleTapToZoomEnabled={true}

                                    dragDecelerationEnabled={true}
                                    dragDecelerationFrictionCoef={0.99}

                                    keepPositionOnRotation={false}
                                    onSelect={this.handleSelect.bind(this)}
                                  />

                            </View>
                        }
                        </View>
                        <View style={styles.menuArea}>
                            <TouchableOpacity onPress={() => this.onStartClicked()} style={styles.menuItem}>
                                <View style={styles.layoutCenter}>
                                    {
                                        (this.state.isStarted && this.state.isStoppable) &&
                                        <Text style={styles.menuItemText}>
                                            Stop
                                        </Text>
                                    }
                                    {
                                        (this.state.isStarted && this.state.isContinuable) &&
                                        <Text style={styles.menuItemText}>
                                            Continue
                                        </Text>
                                    }
                                    {
                                        (!this.state.isStarted && !this.state.isStoppable && !this.state.isContinuable) &&
                                        <Text style={styles.menuItemText}>
                                            Start
                                        </Text>
                                    }
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.onResetClicked()} style={styles.menuItem}>
                                <View style={styles.layoutCenter}>
                                    <Text style={styles.menuItemText}>
                                        Reset Plot
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.onCompleteViewClicked()} style={styles.menuItem}>
                                <View style={styles.layoutCenter}>
                                    {
                                        (this.state.isCompleteView) ?
                                        <Text style={styles.menuItemText}>
                                            TrackView
                                        </Text> :
                                        <Text style={styles.menuItemText}>
                                            Complete View
                                        </Text>
                                    }
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.onBackClicked()} style={styles.menuItem}>
                                <View style={styles.layoutCenter}>
                                    <Text style={styles.menuItemText}>
                                        Back to Setting
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.onQuitClicked()} style={styles.menuItem}>
                                <View style={styles.layoutCenter}>
                                    <Text style={styles.menuItemText}>
                                        Quit
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    layoutCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinnerArea: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: Device.width,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.black,
    },
    headerText: {
        fontSize: 34,
        color: Colors.white,
        textAlign: 'center'
    },
    content: {
        position: 'absolute',
        top: 60,
        width: Device.width,
        height: Device.height - 60,
    },
    contentHeader: {
        flex: 0.1,
        backgroundColor: Colors.black,
    },
    contentHeaderText: {
        fontSize: FontSize.size24,
        color: Colors.white,
        textAlign: 'center',
    },
    contentBody: {
        flex: 0.9,
        flexDirection: 'row',
    },
    graphArea: {
        width: Device.width - 180,
    },
    completeView: {
        flex: 1,
    },
    trackView: {
        flex: 1,
        // backgroundColor: 'blue',
    },
    menuArea: {
        width: 180,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 5,
        borderTopColor: Colors.blue,
        backgroundColor: Colors.black,
    },
    menuItem: {
        height: 48,
        width: 180,
    },
    menuItemText: {
        textAlign: 'center',
        fontSize: 16,
        color: Colors.white,
    },
    chart: {
        flex: 1,
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Check);
