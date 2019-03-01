import React, { Component } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Map, ImageOverlay, Marker, Popup } from 'react-leaflet'
import Control from 'react-leaflet-control';
//import util from '../util/date.js'
//import camera from '../image/icon/camera.png'
import f1 from '../images/btpn_47.png'
import b1 from '../images/btpn_47.png'

/* robinpowered */
class Floor extends Component {

    customPin = L.divIcon({
        className: 'location-pin',
        html: `<div class="pin"></div><div class="pulse"></div>`,
        iconSize: [40, 40],
        iconAnchor: [24, 40]
    });

    constructor(props) {
        super(props);

        const iniBounds = L.latLngBounds(null, null);

        this.state = {
            currentZoomLevel: 0,
            bounds: iniBounds,
            targetFloor: 'delta_f1',
            floors: {
                delta_f1: {
                    name: 'F1',
                    image: f1,
                    markers: []
                },
                delta_b1: {
                    name: 'B1',
                    image: b1,
                    markers: []
                }
            }
        };
    }

    componentDidMount() {
        const map = this.map.leafletElement;

        map.on('zoomend', () => {
            const updatedZoomLevel = map.getZoom();
            this.handleZoomLevelChange(updatedZoomLevel);
        });

        map.on('click', (e) => {
            this.handleAddMarker(e, map);
            //this.handleChangeFloor();
        });

        const h = 1280 * 2,
            w = 806 * 2;

        const southWest = map.unproject([0, h], map.getMaxZoom() - 1);
        const northEast = map.unproject([w, 0], map.getMaxZoom() - 1);

        const bounds = new L.LatLngBounds(southWest, northEast);
        this.setState({ bounds: bounds });
        map.setMaxBounds(bounds);
        (function(){

            var promiseChain = Promise.resolve();
        
        
            var promises = {};
            var callbacks = {};
        
           var init = function() {
        
               const guid = function() {
                   function s4() {
                       return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                   }
                   return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
               }
        
               window.webViewBridge = {
                   /**
                    * send message to the React-Native WebView onMessage handler
                    * @param targetFunc - name of the function to invoke on the React-Native side
                    * @param data - data to pass
                    * @param success - success callback
                    * @param error - error callback
                    */
                   send: function(targetFunc, data, success, error) {
                       success = success || function(){};
                       error = error || function () {};
        
                       var msgObj = {
                           targetFunc: targetFunc,
                           data: data || {},
                           msgId: guid(),
                       };
        
                       var msg = JSON.stringify(msgObj);
        
                       promiseChain = promiseChain.then(function () {
                           return new Promise(function (resolve, reject) {
                               console.log("sending message " + msgObj.targetFunc);
        
                               promises[msgObj.msgId] = {resolve: resolve, reject: reject};
                               callbacks[msgObj.msgId] = {
                                   onsuccess: success,
                                   onerror: error
                               };
        
                               window.postMessage(msg);
                           })
                       }).catch(function (e) {
                           console.error('rnBridge send failed ' + e.message);
                       });
                   },
        
        
               };
        
               window.document.addEventListener('message', function(e) {
                   console.log("message received from react native");
        
                   var message;
                   try {
                       message = JSON.parse(e.data)
                   }
                   catch(err) {
                       console.error("failed to parse message from react-native " + err);
                       return;
                   }
        
                   //resolve promise - send next message if available
                   if (promises[message.msgId]) {
                       promises[message.msgId].resolve();
                       delete promises[message.msgId];
                   }
        
                   //trigger callback
                   if (message.args && callbacks[message.msgId]) {
                       if (message.isSuccessfull) {
                           callbacks[message.msgId].onsuccess.apply(null, message.args);
                       }
                       else {
                           callbacks[message.msgId].onerror.apply(null, message.args);
                       }
                       delete callbacks[message.msgId];
                   }
        
               });
           };
        
           init();
        }());
    }

    componentDidUpdate() {
        console.log(this.state);
    }

    handleZoomLevelChange(newZoomLevel) {
        this.setState({ currentZoomLevel: newZoomLevel });
    }

    handleChangeFloor(e) {
        this.setState({ targetFloor: e.target.dataset.floor });
    }

    handleAddMarker(e, map) {
        // const cid = util.datetick();

        // var _marker = {
        //     id: cid,
        //     lat: e.latlng.lat,
        //     lng: e.latlng.lng
        // }

        // // add Marker to state
        // let _floors = Object.assign({}, this.state.floors);
        // _floors[this.state.targetFloor].markers = [..._floors[this.state.targetFloor].markers, _marker];

        // this.setState({
        //     floors: _floors
        // })
    }

    updateMarkerPosition(e) {

        const { lat, lng } = e.target.getLatLng()

        let updatedMarkers = this.state.floors[this.state.targetFloor].markers.map(m => {
            if (m.id === e.target.options.id) {
                m.lat = lat
                m.lng = lng
            }
            return m;
        })

        // update Marker to state 
        this.setState({ markers: updatedMarkers });
    }

    render() {

        window.console.log('this.state.currentZoomLevel ->', this.state.currentZoomLevel);

        return (
            <div className="App">

                <Map ref={m => { this.map = m; }}
                    center={[0, 0]}
                    zoom={1}
                    minZoom={1}
                    maxZoom={4}
                    crs={L.CRS.Simple}
                    attributionControl={false}
                >

                    <ImageOverlay
                        url={this.state.floors[this.state.targetFloor].image}
                        bounds={this.state.bounds} >

                        {this.state.floors[this.state.targetFloor].markers.map(m =>
                            <Marker
                                key={m.id}
                                id={m.id}
                                draggable={true}
                                onDragend={this.updateMarkerPosition.bind(this)}
                                position={[m.lat, m.lng]}
                                icon={this.customPin}>
                                <Popup minWidth={90}>
                                    <span> Lat:{m.lat}, Lng:{m.lng} </span>
                                </Popup>
                            </Marker>

                        )}

                    </ImageOverlay>

                    <Control position="topright">
                        <div style={{ backgroundColor: 'black', padding: '5px', }}>
                            <button onClick={this.handleChangeFloor.bind(this)} data-floor="delta_f1">F1</button>
                            <button onClick={this.handleChangeFloor.bind(this)} data-floor="delta_b1">B1</button>
                        </div>
                    </Control>

                </Map>
                <ol>
                    {this.state.floors[this.state.targetFloor].markers.map(m => (
                        <li key={m.id}>{`[${m.id}] (${m.lat},${m.lng})`}</li>
                    ))}
                </ol>
            </div>
        );
    }
}


export default Floor;
