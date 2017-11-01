import React, { Component } from 'react';
import {
    AppRegistry,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    DeviceEventEmitter,
    NativeModules,
} from 'react-native';
import { Actions, Scene, Router } from 'react-native-router-flux';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AuthAction from '../actions/auth';
import { Colors, Device, FontSize } from '../lib/device-info';

import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import Modal from 'react-native-modal';

import RNFS  from 'react-native-fs';
import Spinner from 'react-native-spinkit';

const FilePickerManager = require('NativeModules').FilePickerManager;


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

class Main extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tabIndex: 0,
            methodOptionValue: 0,
            tolerenceOptionValue: 0,
            methodOptions: [
                {label: 'GPS', value: 0},
                {label: 'OBD', value: 1}
            ],
            tolerenceOptions: [
                {label: 'Percent', value: 0},
                {label: 'km/h', value: 1}
            ],
            isModalVisible: false,
            downloadUrl: 'https://dl.dropboxusercontent.com/u/26789642/NEDC.csv',
            isDownloaded: false,
            isDownloading: false,
            browseFile: '',
            browseString: '',
            browseData: [],
        };
    }

    componentDidMount() {
        // navigator.geolocation.getCurrentPosition(
        //   (position) => {
        //     var initialPosition = JSON.stringify(position);
        //     console.log('Initial position', initialPosition);
        //     // this.setState({initialPosition});
        //     // this.setState({longitude: position.coords.longitude});
        //     // this.setState({latitude: position.coords.latitude});
        //   },
        //   (error) => console.log('$$$$$$$$$$$$ =====>   ', error.message),
        //   {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        // );
    }

    onMethodClicked() {
        this.setState({
            tabIndex: 0,
        });
    }

    onToleranceClicked() {
        this.setState({
            tabIndex: 1,
        });
    }

    onReferenceFileClicked() {
        this.setState({
            tabIndex: 2,
        })
    }

    onToleranceChosen() {
        console.log('---');
    }

    onDownloadClicked = () => {
        this.setState({
            isModalVisible: true,
        });
    }

    onCancelClicked() {
        this.setState({
            isModalVisible: false,
        });
    }

    onDownloadConfirmClicked() {
        this.setState({
            isModalVisible: false,
            isDownloading: true,
        });

        RNFS.downloadFile({
            fromUrl: this.state.downloadUrl,
            toFile: `${RNFS.DocumentDirectoryPath}/graph.csv`,
        }).promise.then((r) => {
            this.setState({
                isDownloaded: true,
                isDownloading: false,
            });
        }).catch((err) => {
            alert(err);
            this.setState({
                isDownloading: false,
                isDownloaded: true,
            })
            return false;
        });
    }

    onBrowseClicked() {
        FilePickerManager.showFilePicker(null, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled file picker');
            } else if (response.error) {
                console.log('FilePickerManager Error: ', response.error);
            } else {
                this.setState({
                    browseFile: response.path,
                });
            }
        })
    }

    onCheckClicked() {
        RNFS.readFile(this.state.browseFile)
        .then((result) => {
            this.setState({
                browseString: result,
                // browseData: result.split(','),
            });
            Actions.check({browseData: result.split(','), tolerenceOption: this.state.tolerenceOptionValue});
        }).catch((err) => {
            alert(err);
            return false;
        });
    }

    render() {
        
        const { tabIndex, isModalVisible, downloadUrl, isDownloading, tolerenceOptions, methodOptions } = this.state

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Driving Cycle Checker</Text>
                </View>
                <View style={styles.content}>
                    <View style={styles.tabArea}>
                        <TouchableOpacity onPress={() => this.onMethodClicked()} style={[styles.tabBarItem, (tabIndex == 0) && styles.tabBarBorder]}>
                            <View>
                                <Text style={styles.textTabBarItem}>
                                    Method
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.onToleranceClicked()} style={[styles.tabBarItem, (tabIndex == 1) && styles.tabBarBorder]}>
                            <View>
                                <Text style={styles.textTabBarItem}>
                                    Tolerence
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.onReferenceFileClicked()} style={[styles.tabBarItem, (tabIndex == 2) && styles.tabBarBorder]}>
                            <View>
                                <Text style={styles.textTabBarItem}>
                                    Reference File(.CSV)
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tabContentArea}>
                        {
                            (tabIndex == 0) ?
                            <RadioForm
                                radio_props={methodOptions}
                                initial={0}
                                formHorizontal={true}
                                labelHorizontal={false}
                                animation={true}
                                onPress={(value) => {this.setState({methodOptionValue: value})}}
                            /> :
                            null
                        }
                        {
                            (tabIndex == 1) ?
                            <View style={styles.tabContent}>
                                <View style={styles.tolerenceTextArea}>
                                    <Text style={styles.tolerenceText}>
                                        10
                                    </Text>
                                </View>
                                <RadioForm
                                    radio_props={tolerenceOptions}
                                    initial={0}
                                    formHorizontal={false}
                                    animation={true}
                                    style={styles.optionBox}
                                    onPress={(value) => {this.setState({tolerenceOptionValue: value})}}
                                >
                                </RadioForm>
                            </View> :
                            null
                        }
                        {
                            (tabIndex == 2) ?
                            <View style={styles.buttonsArea}>
                                <TouchableOpacity onPress={this.onDownloadClicked}>
                                    <View style={styles.importDataButton}>
                                        <Text style={styles.importButtonText}>Download</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.onBrowseClicked()}>
                                    <View style={styles.importDataButton}>
                                        <Text style={styles.importButtonText}>Browse Device</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.onCheckClicked()}>
                                    <View style={styles.importDataButton}>
                                        <Text style={styles.importButtonText}>DC Check</Text>
                                    </View>
                                </TouchableOpacity>
                                <Modal isVisible={isModalVisible}>
                                    <View style={styles.downloadModal}>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalHeaderText}>Source</Text>
                                            <Text style={styles.modalDescription}>Enter URL to CSV</Text>
                                        </View>
                                        <View style={styles.modalContent}>
                                            <TextInput
                                                style={{height: 40}}
                                                placeholder="Type here to download!"
                                                value={downloadUrl}
                                                onChangeText={(downloadUrl) => this.setState({downloadUrl})}
                                            />
                                        </View>
                                        <View style={styles.modalFooter}>
                                            <TouchableOpacity onPress={() => this.onDownloadConfirmClicked()}>
                                                <View style={styles.downloadModalButton}>
                                                    <Text style={styles.downloadModalButtonText}>Download</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.onCancelClicked()}>
                                                <View style={styles.downloadModalButton}>
                                                    <Text style={styles.downloadModalButtonText}>Cancel</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                                <Modal isVisible={isDownloading}>
                                    <View style={styles.spinnerArea}>
                                        <Spinner
                                            style={styles.spinner}
                                            isVisible={isDownloading}
                                            size={100}
                                            type='Wave'
                                            color='#FFF'
                                        />
                                    </View>
                                </Modal>
                            </View> :
                            null
                        }
                    </View>
                </View>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>Settings</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
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
        fontSize: FontSize.size34,
        color: Colors.white,
        textAlign: 'center'
    },
    tag: {
        position: 'absolute',
        left: 120,
        top: 80,
        width: 120,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.darkGreyColor,
    },
    tagText: {
        fontSize: 14,
        color: Colors.white,
    },
    content: {
        position: 'absolute',
        top: 60,
        flexDirection: 'row',
        width: Device.width,
        height: Device.height - 60,
    },
    tabArea: {
        width: 180,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 5,
        borderTopColor: Colors.blue,
        backgroundColor: Colors.black,
    },
    tabBarItem: {
        width: 180,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBarBorder: {
        borderRightWidth: 5,
        borderRightColor: Colors.darkGreyColor,
    },
    textTabBarItem: {
        textAlign: 'center',
        fontSize: 16,
        color: Colors.white,
    },
    tabContentArea: {
        width: Device.width - 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContent: {
        flexDirection: 'row',
    },
    tolerenceTextArea: {
        flex: 0.4,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 20,
    },
    tolerenceText: {
        color: 'red',
        fontSize: 64,
        fontWeight: '900',
    },
    optionBox: {
        flex: 0.6,
        alignItems:'flex-start',
    },
    buttonsArea: {
        flexDirection: 'row',
    },
    importDataButton: {
        width: 120,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: Colors.blue,
        backgroundColor: Colors.black,
    },
    importButtonText: {
        color: Colors.white
    },
    downloadModal: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.white,
    },
    modalHeader: {
        // height: 90,
        flex: 0.5
    },
    modalHeaderText: {
        textAlign: 'left',
        fontSize: 32,
        color: Colors.black,
        fontWeight: '900'
    },
    modalDescription: {
        textAlign: 'left',
        fontSize: 24,
        color: Colors.darkGreyColor,
        fontWeight: '600',
    },
    modalContent: {
        flex: 0.2,
    },
    modalFooter: {
        flex: 0.3,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    downloadModalButton: {
        height: 40,
        width: 100,
        marginLeft: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.black,
    },
    downloadModalButtonText: {
        textAlign: 'center',
        fontSize: 20,
        color: Colors.white,
        fontWeight: '300',
    },
    spinnerArea: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
