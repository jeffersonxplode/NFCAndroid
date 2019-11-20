import React from 'react'
import {
  View, Text, TouchableOpacity
} from 'react-native'
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';

class AppV2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            supported: true,
            enabled: false,
            isWriting: false,
            urlToWrite: 'https://www.google.com',
            parsedText: null,
            tag: {},
        }
    }

  componentDidMount() {
    //NfcManager.start();
    NfcManager.isSupported()
                .then(supported => {
                    this.setState({ supported });
                    if (supported) {
                        this._startNfc();
                    }
     });
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      console.warn('tag', tag);
      NfcManager.setAlertMessageIOS('I got your tag!');
      alert('opa peguei sua tag')
      NfcManager.unregisterTagEvent().catch(() => 0);
    });
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  render() {
   let { supported, enabled, tag, isWriting, urlToWrite, parsedText } = this.state;
    return (
      <View style={{padding: 20}}>

        <Text>Exemplo NFC</Text>
        <Text>{`O dispositivo suporta NFC? ${supported}`}</Text>
        <Text>{`O NFC está habilitado? ${enabled}`}</Text>
        <TouchableOpacity
          style={{padding: 10, width: 200, margin: 20, borderWidth: 1, borderColor: 'black'}}
          onPress={this._test}
        >
          <Text>Testar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{padding: 10, width: 200, margin: 20, borderWidth: 1, borderColor: 'black'}}
          onPress={this._cancel}
        >
          <Text>Cancelar Teste</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _cancel = () => {
    NfcManager.unregisterTagEvent().catch(() => 0);
      console.log('NFC cansou de esperar');
      alert("NFC cansou de esperar...")
  }

  _test = async () => {
    try {
      await NfcManager.registerTagEvent();
      console.log('NFC esperando');
      alert("NFC esperando...")
    } catch (ex) {
      console.warn('ex', ex);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  }

   _startNfc() {
          NfcManager.start({
              onSessionClosedIOS: () => {
                  console.log('ios session closed');
              }
          })
              .then(result => {
                  console.log('start OK', result);
              })
              .catch(error => {
                  console.warn('start failaaa', error);
                  this.setState({supported: false});
              })

          if (Platform.OS === 'android') {
              NfcManager.getLaunchTagEvent()
                  .then(tag => {
                      console.log('launch tag', tag);
                      if (tag) {
                          this.setState({ tag });
                      }
                  })
                  .catch(err => {
                      console.log(err);
                  })
              NfcManager.isEnabled()
                  .then(enabled => {
                      this.setState({ enabled });
                  })
                  .catch(err => {
                      console.log(err);
                  })
              NfcManager.onStateChanged(
                  event => {
                      if (event.state === 'on') {
                          this.setState({enabled: true});
                      } else if (event.state === 'off') {
                          this.setState({enabled: false});
                      } else if (event.state === 'turning_on') {
                          // do whatever you want
                      } else if (event.state === 'turning_off') {
                          // do whatever you want
                      }
                  }
              )
                  .then(sub => {
                      this._stateChangedSubscription = sub;
                      // remember to call this._stateChangedSubscription.remove()
                      // when you don't want to listen to this anymore
                  })
                  .catch(err => {
                      console.warn(err);
                  })
          }
      }
}

export default AppV2
