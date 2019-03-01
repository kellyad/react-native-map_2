import Leaflet from 'leaflet';
import React, { Component, StrictMode, createRef } from 'react';
import { Map, Marker, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import './markerAnimations.css';
import './normalize.min.css';

import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import './markers.css';
import pin_free from './pin_free.png';
import pin_reserved from './pin_reserved.png';
import pin_booked from './pin_booked.png';

const util = require('util');

const MESSAGE_PREFIX = 'react-native-webview-leaflet';

Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/';

const SHOW_DEBUG_INFORMATION = false;

class mapComponent extends Component {
  constructor(props) {
    super(props);
    const iniBounds = L.latLngBounds(null, null);
    this.mapMarkerDictionary = {};
    this.mapRef = createRef();
    this.state = {
      initialFloor : 1,
      ownPosition: {},
      ownPositionMarker: {},
      centerPosition: [0,0],
      zoom: 1,
      debugMessages: [],
      locations: [],
      markers: [],
      height : 806,
      width : 806,
      mapLoaded : false,
      showAttributionControl: false,
      image : 'https://image.ibb.co/h7nrCp/J1QS.gif',
      bounds : iniBounds
    };
  }
  componentDidMount = () => {
    if( this.map !== null &&  this.state.height > 0 && this.state.width > 0 ){

      const map = this.map.leafletElement;
      const h = this.state.height,
            w = this.state.width;
      const southWest = map.unproject([0, h], map.getMaxZoom() - 1);
      const northEast = map.unproject([w, 0], map.getMaxZoom() - 1);
      const bounds = L.latLngBounds(southWest, northEast);

      this.setState({ bounds: bounds });
      map.setMaxBounds(bounds);

      if ( JSON.stringify(this.state.locations) ) {
        let markers = this.state.locations.map((location) => {
            return {
              id: location.id,
              coords: location.coords,
              divIcon: this.createDivIcon(location)
            };
        });
        this.setState({ markers }, ()=>{
        });
      }
      
    }
    this.printElement('leafletReactHTML.js componentDidMount');

    // add the event listeners
    if (document) {
    document.addEventListener('message', this.handleMessage), false;
    // this.printElement('using document');
    } else if (window) {
    window.addEventListener('message', this.handleMessage), false;
    // this.printElement('using window');
    } else {
    return;
    }

    this.eventListenersAdded = true;

    setTimeout(() => {
    this.onMapEvent('onLoad', { loaded: true });
    }, 500);

  };

  componentWillUnmount = () => {
    if (document) {
      document.removeEventListener('message', this.handleMessage);
    } else if (window) {
      window.removeEventListener('message', this.handleMessage);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    let that = this;

    if (this.state.coords !== prevState.coords) {
      this.printElement(`updating coords to ${this.state.coords}`);
    }

    // update the locations if they have changed
    if (
      JSON.stringify(this.state.locations) !==
      JSON.stringify(prevState.locations)
    ) {
      let markers = [];
      markers = this.state.locations.map((location) => {
          return {
            id: location.id,
            coords: location.coords,
            divIcon: that.createDivIcon(location)
          };
      });
      this.sendMessage({event : 'onLoad', payload : markers})
      this.setState({ markers : markers });
    }

    // update the bounds if they have changed
    if (
      JSON.stringify(this.state.bounds) !==
      JSON.stringify(prevState.bounds)
    ) {
      this.map.leafletElement.fitBounds(
        this.state.bounds,
        this.state.padding
      )
    }
  };

  // print passed information in an html element; useful for debugging
  // since console.log and debug statements won't work in a conventional way
  printElement = (data) => {
    if (SHOW_DEBUG_INFORMATION) {
      let message = '';
      if (typeof data === 'object') {
        message = util.inspect(data, { showHidden: false, depth: null });
      } else if (typeof data === 'string') {
        message = data;
      }
      this.setState({
        debugMessages: [...this.state.debugMessages, message]
      });
    }
  };

  createDivIcon = (location) => {
    let divIcon = L.divIcon({
      className: 'clearMarkerContainer',
      html: location.animation? this.getAnimatedHTMLString(
        location.icon ,
        null,
        location.size || [24, 24]
      ) :
      this.getUnanimatedHTMLString(location.icon, location.size)
    });
    return divIcon;
  };

  /*
  Get the HTML string containing the icon div, and animation parameters
  */
  getAnimatedHTMLString = (icon, animation, size = [24, 24]) => {
    let Icon = icon  === '../../../assets/images/pin_free.png'
                ? 'https://image.ibb.co/egVNqp/pin_free.png'
                : icon === '../../../assets/images/pin_booked.png'
                  ? 'https://image.ibb.co/hfbmWU/pin_booked.png'
                  : 'https://image.ibb.co/b3LcO9/pin_reserved.png';
    let iconSizeString = `<div style='font-size: ${Math.max(
      size[0],
      size[1]
    )}px'>`;

    return `<div>
      ${iconSizeString}
      <img src=${Icon} class="leaflet-marker-icon leaflet-zoom-animated leaflet-interactive" alt="" tabindex="0" style="margin-left: -22px; margin-top: -42px; width: 30px; height: 42px;"><div class="pulse"></div></img>
      </div>
      </div>`;
  };

  getUnanimatedHTMLString = (icon, animation, size = [24, 24]) => {
    let Icon = icon  === '../../../assets/images/pin_free.png'
                ? 'https://image.ibb.co/egVNqp/pin_free.png'
                : icon === '../../../assets/images/pin_booked.png'
                  ? 'https://image.ibb.co/hfbmWU/pin_booked.png'
                  : 'https://image.ibb.co/b3LcO9/pin_reserved.png';
    let iconSizeString = `<div style='font-size: ${Math.max(
      size[0],
      size[1]
    )}px'>`;

    return `<div class='unanimatedIconContainer' >
      ${iconSizeString}
      <img src=${Icon} class="leaflet-marker-icon leaflet-zoom-animated leaflet-interactive" alt="" tabindex="0" style="margin-left: -22px; margin-top: -42px; width: 30px; height: 42px;"></img>
      </div>
      </div>`;
  };

  // data to send is an object containing key value pairs that will be
  // spread into the destination's state
  sendMessage = (payload) => {
    // this.printElement(`in send message payload = ${JSON.stringify(payload)}`);

    const message = JSON.stringify({
      prefix: MESSAGE_PREFIX,
      payload: payload
    });

    if (document.hasOwnProperty('postMessage')) {
      document.postMessage(message, '*');
    } else if (window.hasOwnProperty('postMessage')) {
      window.postMessage(message, '*');
    } else {
    }
    // this.printElement(`sending message: ${JSON.stringify(message)}`);
  };

  handleMessage = (event) => {
    this.printElement(`received message ${JSON.stringify(event)}`);
    this.printElement(
      util.inspect(event.data, {
        showHidden: false,
        depth: null
      })
    );

    let msgData;
    try {
      msgData = JSON.parse(event.data);
      if (
        msgData.hasOwnProperty('prefix') &&
        msgData.prefix === MESSAGE_PREFIX
      ) {
        if( this.state.image !== msgData.payload.image ) 
          { this.setState({ ...this.state, ...msgData.payload });
            this.componentDidMount(); }
        else 
        this.setState({ ...this.state, ...msgData.payload });
      }
    } catch (err) {
      this.printElement(`leafletReactHTML error: ${err}`);
      return;
    }
  };

  onMapEvent = (event, payload) => {
    // build a payload if one is not provided
    if (!payload) {
      payload = {
        center: this.map.leafletElement.getCenter(),
        bounds: this.map.leafletElement.getBounds(),
        zoom: this.map.leafletElement.getZoom()
      };
    }
    /* this.printElement(
      `onMapEvent: event = ${event}, payload = ${JSON.stringify(payload)}`
    ); */

    this.sendMessage({
      event,
      payload
    });
  };

  render() {
    return (
      <StrictMode>
      <div className="App">
        <Map
          style={{
            width: '100%',
            backgroundColor: 'rgba(221, 225, 221, 0.2)'
          }}
          minZoom={1}
          maxZoom={4}
          ref={m =>{this.map = m}}
          crs={L.CRS.Simple}
          center={this.state.centerPosition}
          attributionControl={this.state.showAttributionControl}
          zoomControl={true}
          panToLocation={this.state.panToLocation}
          zoom={this.state.zoom}
         
          onClick={(event) => {
            this.onMapEvent('onMapClicked', {
              coords: [event.latlng.lat, event.latlng.lng]
            });
          }}
          onZoomLevelsChange={() => {
            this.onMapEvent('onZoomLevelsChange', null);
          }}
          onResize={() => {
            this.onMapEvent('onResize', null);
          }}
          onZoomStart={() => {
            this.onMapEvent('onZoomStart', null);
          }}
          onMoveStart={() => {
            this.onMapEvent('onMoveStart', null);
          }}
          onZoom={() => {
            this.onMapEvent('onZoomLevelsChange', null);
          }}
          onMove={() => {
            this.onMapEvent('onResize', null);
          }}
          onZoomEnd={() => {
            this.onMapEvent('onZoomStart', null);
          }}
          onMoveEnd={() => {
            this.onMapEvent('onMoveStart', null);
          }}
          onUnload={() => {
            this.onMapEvent('onUnload', null);
          }}
          onViewReset={() => {
            this.onMapEvent('onViewReset', null);
          }}
          onLoad={() => {
            this.onMapEvent('onLoad', null);
          }}
        > 
          { this.state.image !== "" && (<ImageOverlay
                url={this.state.image}
                bounds={this.state.bounds} >

            </ImageOverlay>
            
          )}

          {this.state.markers.length > 0  && this.state.markers.map((marker) => {
            if(marker){
              let data =  (document.hasOwnProperty('postMessage')) ?
                document.location.origin
              : window.location.origin
              
            return (
              <Marker
                key={marker.id}
                position={marker.coords}
                icon={marker.divIcon}
                onClick={() => {
                  this.onMapEvent('onMapMarkerClicked', { id: marker.id , data : data});
                }}
              />
            );
          }
          })}
        </Map>
            </div>
        {SHOW_DEBUG_INFORMATION ? (
          <div
            style={{
              backgroundColor: 'rgba(221, 225, 221, 0.2)',
              maxHeight: '200px',
              overflow: 'auto',
              padding: 5,
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 15000
            }}
            id="messages"
          >
            <ul>
              {this.state.debugMessages.map((message, index) => {
                return <li key={index}>{message}</li>;
              })}
            </ul>
          </div>
        ) : null}
      </StrictMode>
    );
  }
}

export default mapComponent;
