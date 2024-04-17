import { MapContainer,GeoJSON,ZoomControl,Marker } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-timedimension";
import "../../../node_modules/leaflet-timedimension/dist/leaflet.timedimension.control.min.css";

import marker from './marker.svg';

import {Icon,divIcon} from 'leaflet';

import { PlottyGeotiffLayer, VectorArrowsGeotiffLayer,ControllerLayer,BasemapControlLayer, ResultPopup,TimeSeriesPopup } from "../../layers/Layers";

import { useState, useRef, useEffect } from "react";

import { Drawer } from '@mui/material';

import dayjs from 'dayjs';

// currentTimes
let cTime = new Date();
cTime.setUTCDate(1);

// Timedimension options
const timeDimensionOptions ={
    timeInterval:"2014-09-30/2014-10-30",
    period:"P1M",
};

export default function Maps(){
    // maptype
    const [mtype,setMtype] = useState("carto");

    // Layer control
    const [RasterLayer, setRasterLayer] = useState(true);

    // SSC control
    const [isSSC, setIsSSC] = useState(false);

    // data name (TODO : Change)
    const [DataName, setDataName] = useState("SST");
    const [DataType, setDataType] = useState("Daily");

    // Data Date
    const [DataDate, setDataDate] = useState(dayjs('2020-09-01'));
    // Default tiff file path

    const [DataUrl, setDataUrl] = useState(`/api/dataresult/${DataName}/${DataDate.format('YYYYMMDD')}/${DataType}`)
    
    const [SSCDataUrl, setSSCDataUrl] = useState(`/api/dataresult/SSC/${DataDate.format('YYYYMMDD')}/${DataType}`);

    const layerRef = useRef(null);

    // Raster tiff option
    const [DataSpeedOptions, setDSOptions] = useState({
        band: 0,
        displayMin: 15,
        displayMax: 35,
        name: "Current speed",
        colorScale: "turbo",
        clampLow: false,
        clampHigh: true
    });
    
    // Vector tiff option
    const [DataDirectionOptions, setDDOptions] = useState({
        band: 0,
        name: "direction",
        arrowSize: 15
    })


    // Markers
    // TODO : get Data and set markers
    const [Markers, setMarkers] = useState([
        {
            id : 0,
            position:[35.96464167,126.2388444],
            name : '군산'
        },
        {
            id : 1,
            position:[35.652435,129.7029],
            name : '울산'
        }
    ]);
    
    // Select Market
    const [SelectMarker, setSelectMarker] = useState(Markers[0]);


    // Result popup
    const [RPopen, setRPopen] = useState(false);

    useEffect(()=>{
        console.log(RPopen)
    },[RPopen])

    // Time Series popup
    const [TSopen, setTSopen] = useState(true);

    // popup close handler
    const RPclose = () => {
        console.log('hiclose')
        setRPopen(false)};
    const TSclose = () => setTSopen(false);

    // Data Date Handler
    const DataDateHandler = (e) => {
        setDataDate(e);
        setDataUrl(`/api/dataresult/${DataName}/${e.format('YYYYMMDD')}/${DataType}`);
        setSSCDataUrl(`/api/dataresult/SSC/${e.format('YYYYMMDD')}/${DataType}`);
    };

    const BasemapHandler = (e)=>setMtype(e.target.value);

    const CscaleHandler = (e)=>{
        let tmpDSOptions = {...DataSpeedOptions};
        tmpDSOptions['colorScale'] = e.target.value;
        setDSOptions(tmpDSOptions);
    }
    // TODO : Backend link and change url
    const DataHandler = (e)=>{
        setDataName(e.target.value);
        setDataUrl(`/api/dataresult/${e.target.value}/${DataDate.format('YYYYMMDD')}/${DataType}`);
        setTSopen(false);
        if (e.target.value==='10m'){
            setMarkers([
                {
                    id : 0,
                    position:[32.122778,125.182222],
                    name : '이어도 해양과학기지'
                },
            ])}
        else{
            setMarkers([
                {
                    id : 0,
                    position:[35.96464167,126.2388444],
                    name : '군산'
                },
                {
                    id : 1,
                    position:[35.652435,129.7029],
                    name : '울산'
                }
            ])
        }
            
    }
    const RLayerHandler = (e) => {setRasterLayer(e.target.checked)};
    
    const SSCHandler = (e) => setIsSSC(e.target.checked);

    const DataTypeHandler = (e) => setDataType(e.target.value);

    // TEST : get json files from backend and add to map
    const [jsonFiles, setJsonFiles] = useState(null);
    useEffect(() => {
        fetch("/api/mapList")
        .then(res => res.json())
        // .then(data => console.log(data))
        .then(data => setJsonFiles(data.result))
        .catch(err => console.log(err));

        console.log(jsonFiles);
    }, []);

    // change color scale and minmax when data changed
    useEffect(() => {
        // open data result
        setRPopen(true);
        // set color scale and minmax
        let tmpDSOptions = {...DataSpeedOptions};
        switch(DataName){
            case 'SST':
                tmpDSOptions['colorScale'] = "turbo";
                tmpDSOptions['displayMin'] = 15;
                tmpDSOptions['displayMax'] = 35;
                setDSOptions(tmpDSOptions);
                break;
            case 'SSS':
                tmpDSOptions['colorScale'] = "jet";
                tmpDSOptions['displayMin'] = 0;
                tmpDSOptions['displayMax'] = 45;
                setDSOptions(tmpDSOptions);
                break;
            case 'chl':
                tmpDSOptions['colorScale'] = "greens";
                tmpDSOptions['displayMin'] = 0;
                tmpDSOptions['displayMax'] = 10;
                setDSOptions(tmpDSOptions);
                break;
                case '10m':
                    tmpDSOptions['colorScale'] = "greens";
                    tmpDSOptions['displayMin'] = 28;
                    tmpDSOptions['displayMax'] = 35;
                setDSOptions(tmpDSOptions);
                break;
            default:
                break;
        }
    }, [DataName]);


    // Map Style
    const mapStyle = ()=>({
        fillColor: "080808",
        fillOpacity: 1,
        color:'black',
        weight: 1,
    });
    
    return(
        <MapContainer className="Mapcontainers" 
            center={[36, 126.5]} 
            zoom={6}
            timeDimension
            timeDimensionOptions={timeDimensionOptions}
            // timeDimensionControl
            style={{backgroundColor:'#252525'}}
        >
            {/* Zoom */}
            <ZoomControl position="topright" />

            

            {/* Result Popup */}
            {/* Speed Layer Start (Plotly) */}
            {RasterLayer?<PlottyGeotiffLayer
                className="RLY"
                url={DataUrl}
                options={DataSpeedOptions}
                zIndex={-1000}
                />:null}
            {/* Speed Layer End */}

            {/* Vector Layer Start */}
            
            {/* SSC */}
            {isSSC?<VectorArrowsGeotiffLayer
                className="ALY"
                url={SSCDataUrl}
                options={DataDirectionOptions}
                layerRef={layerRef}
                zIndex={1000}
                />:null}

            {/* Vector Layer End */}
            
            {/* Controller Start */}
            <ControllerLayer controlList={{
                'basemap':{'value':mtype,'handler':BasemapHandler},
                'cscale':{'value':DataSpeedOptions['colorScale'],'handler':CscaleHandler},
                'data':{'value':DataName,'handler':DataHandler},
                'isSsc':{'value':isSSC,'handler':SSCHandler},
                'RLayer':{'value':RasterLayer,'handler':RLayerHandler},
                'display':{'min':DataSpeedOptions['displayMin'],'max':DataSpeedOptions['displayMax']},
                'date':{'value':DataDate,'handler':DataDateHandler},
                'dataType':{'value':DataType,'handler':DataTypeHandler},
            }}/>
            {/* Controller End */}

            {/* Map Layer Start  */}
                {mtype!=='shape'?<BasemapControlLayer className='MAP' maptype={mtype}/>:null}
            {/* GeoJson Layer Start */}
            {jsonFiles&&mtype==='shape'?jsonFiles.map((data,index) =>(
                <GeoJSON
                key={index}
                data={data}
                style={mapStyle}
                />
                )):null}
            {/* GeoJson Layer End */}
            {/* Map Layer End */}


            {/* Marker */}
            {Markers.map((data,index)=>(
                <Marker key={index} position={data.position}
                    icon={
                        new divIcon({
                            html:'<span class="marker_label">'+data.name+'</span><img src='+marker+'></img>',
                            iconSize:[3,3],
                            className:'marker'
                        })
                    }
                    eventHandlers={{
                        click: (e) => {
                            setSelectMarker(data);
                            setTSopen(true);
                        },
                    }}
                >
                    {/* <Popup>
                        {data.name}
                    </Popup> */}
                </Marker>
            ))}

            {/* Result Popup */}
            {RPopen?<ResultPopup open={RPopen} setClose={RPclose} data={DataName} marker={SelectMarker}/>:null}
            {/* Time Series Popup */}
            {TSopen?<TimeSeriesPopup open={TSopen} setClose={TSclose} marker={SelectMarker} data={DataName}/>:null}

            {/* Test */}
            {/* <Drawer
                anchor="right"
                open={true}
                // onClose={RPclose}
                >
                <div>
                    <h1>TEST</h1>
                </div>
            </Drawer> */}

        </MapContainer>
    )  
}