import "leaflet-geotiff-2";
import "leaflet-geotiff-2/dist/leaflet-geotiff-rgb";
import "leaflet-geotiff-2/dist/leaflet-geotiff-vector-arrows";
import "leaflet-geotiff-2/dist/leaflet-geotiff-plotty"; // requires plotty
import L from "leaflet";
import { useMap, TileLayer } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, InputLabel, MenuItem, Select, FormControl,FormControlLabel,Switch, Paper, Radio, RadioGroup, Button, Table, TableBody, TableContainer, TableCell,TableHead,TableRow, Drawer } from '@mui/material';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


function GeotiffLayer({ url, options, Types }) {
    const map = useMap();
    const layerRef = useRef(null);
  
    useEffect(() => {
      const leafletElement = L.leafletGeotiff(url, options);
      Types==='plotty'?leafletElement.setZIndex(100):leafletElement.setZIndex(200);
      layerRef.current = leafletElement;
      leafletElement.addTo(map);

      const onMapClicks = (e)=>{
        const latlng = e.latlng;
        const value = leafletElement.getValueAtLatLng(latlng.lat,latlng.lng);
        if(value !== null && value !== undefined){
          // const returns = Types === 'plotty'? {'speed':value}:{'direction':value};
          const returns = {'speed':value};
          console.log(returns);
        }
      }

      map.on("click", onMapClicks);
  
      return () => {
        if (leafletElement) {
          leafletElement.remove();
        }
        map.off("click",onMapClicks);
      };
    }, [map, url, options,Types]);
  
    return null;
}

/**
 * Visualize speed using u,v data that is included at tiff file
 * @param {dict} options params for Plotty
 * @param {dict} props other options
 * @returns GeotiffLayer
*/
function PlottyGeotiffLayer({ options, ...props }) {
  const renderer = new L.LeafletGeotiff.Plotty(options);
  // get ColorbarDataUrl
  const [colorbarDataUrl,setColorbarDataUrl] = useState(null);

  useEffect(()=>{
    const dd = renderer.getColorbarDataUrl(options.colorScale);
    setColorbarDataUrl(dd);
  },[options.colorScale]);


  // draw colorbar
  useEffect(()=>{
    if(colorbarDataUrl){
      // if img already exist, change src
      const img = document.getElementById('Colorbarimg');
      if(img){
        img.src = colorbarDataUrl;
      }else{
        const newimg = document.createElement('img');
        newimg.id = 'Colorbarimg'
        newimg.classList.add('Colorbarimg');
        newimg.src = colorbarDataUrl;
        
        document.getElementsByClassName('Colorbar')[0].appendChild(newimg);
      }
    }
  },[colorbarDataUrl]);
  
  // useEffect(()=>{
  //   // if img already exist, change src
  //   const img = document.getElementById('Colorbarimg_ssc');
  //   const gradientColors = [
  //     '#8000f1',
  //     '#800080',
  //     '#c71585',
  //     '#ff00f1',
  //     '#00adf5',
  //     '#00ddf3',
  //     '#00ff10',
  //     '#80ff10',
  //     '#ffff00',
  //     '#ff8800',
  //     '#ff0000'
  //   ];
  //   const gradientStyle = `linear-gradient(to right, ${gradientColors.join(', ')})`;
  //   if(img){
  //   }else{
  //     const newimg = document.createElement('img');
  //     newimg.id = 'Colorbarimg_ssc'
  //     newimg.classList.add('Colorbarimg_ssc');
  //     newimg.style.backgroundImage = gradientStyle;
      
  //     document.getElementsByClassName('Colorbar_ssc')[0].appendChild(newimg);
  //   }
  // },[]);

  

  return <GeotiffLayer {...props} options={{ ...options, renderer }} Types={'plotty'} />;
}

/**
 * Visualize direction using u,v data that is included at tiff file
 * @param {dict} options params for VectorArrows
 * @param {dict} props other options
 * @returns GeotiffLayer
 */
function VectorArrowsGeotiffLayer({ options,zIndex, ...props }) {
  const renderer = new L.LeafletGeotiff.VectorArrows(options);

  useEffect(()=>{
    if(props.layerRef.current){
      props.layerRef.current.setZIndex(zIndex);
    }
  },[props.layerRef, zIndex]);

  return <GeotiffLayer {...props} options={{ ...options, renderer }}/>;
}


/**
 * BasemapControl Layer
 * @param {string} maptype map type (ex. openstreet, carto)
 * @returns TileLayer
 */
function BasemapControlLayer({ maptype }){
  const [mapUrl, setMapUrl] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  const [att, setAtt] = useState('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
  useEffect(()=>{
    
    switch(maptype){
      // carto map
      case 'cartoDark':
        setMapUrl("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png");
        break;

      case 'cartoLight':
        setMapUrl("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png");
      
      // custom map
      
      // openstreet map
      default:
        setMapUrl("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
        setAtt('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors');
    }
  },[maptype])

  return (
    <TileLayer
      attribution={att}
      url={mapUrl}
    />
  );

}

// get array of two value
const getNumberArray = (start, end) => {
  const step = (end - start) / 4;
  const newSequence = Array.from({ length: 5 }, (_, index) =>
    (start + step * index).toFixed(1)
  );
  return newSequence;
};


// /**
//  * Layer to control map and data visualization
//  * @param {dict} controlList  control : handler
//  * @returns Layer created using MUI(Accordion) 
//  */
// function ControllerLayer({controlList}){
//   const cList = {...controlList};
//   const unit = cList.data.value === 'SST'?'℃':
//               cList.data.value === 'chl'?'㎍/L':
//               'psu';
//   return (
//     <Accordion className="Controller">
//       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//         <Typography className="ControllerT">Controller</Typography>
//       </AccordionSummary>

//       <AccordionDetails className="Controller_D">
//         {/* Color Scale bar */}
//         <b>표층해류 (m/s)</b>
//         <Paper className="Colorbar_ssc">
//                 <img id='Colorbarimg_ssc' className='Colorbarimg_ssc' src=""/>
//                 <div className='colorbar_num'>
//                     {getNumberArray(0.00,2.00).map((data,index)=>(
//                         <p key={index}>{data}</p>
//                     ))}
//                 </div>
//         </Paper>

//         <b>{cList.data.value} ({unit})</b>
//         <Paper className="Colorbar">
//                 <div className='colorbar_num'>
//                     {getNumberArray(cList.display.min,cList.display.max).map((data,index)=>(
//                         <p key={index}>{data}</p>
//                     ))}
//                 </div>
//         </Paper>


//         {/* Date Control */}
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <b className="ControllerHeader">Date</b>
//           <DatePicker
//             className="ControllerD"
//             value={cList.date.value||''}
//             onChange={cList.date.handler}
//           />
//           {
//             cList.dataType.value === 'Hourly'?
//             <TimePicker className="ControllerD" views={['hours']} />:
//             <TimePicker className="ControllerD" disabled views={['hours']} />
//           }
//         </LocalizationProvider>


//         {/* Data Control */}
//         <FormControl className="ControllerSWrapper" size="small">
//           <b style={{'marginTop':'1rem'}} className="ControllerHeader">Data</b>
//           <Select
//             className="ControllerS"
//             labelId="dataL"
//             id="dataS"
//             value={cList.data.value}
//             onChange={cList.data.handler}
//           >
//             {
//               [
//                 {name:'SST',value:'SST'},
//                 {name:'SSS',value:'SSS'},
//                 {name:'Chl_a',value:'chl'},
//                 {name:'10m_Low_Salinity',value:'10m'}
//               ].map(data=>{
//                 return(<MenuItem className="ControllerL_M" value={data.value}>{data.name}</MenuItem>)
//               })
//             }
//           </Select>
//         </FormControl>

//         {/* Select Daily, Hourly Data for SST Data */}
        
//         <FormControl className="ControllerSWrapper" size="small">
//           <b style={{'marginBottom':'0rem'}} className="ControllerHeader">Data Type</b>
//           {cList.data.value === 'SST'?
//             <RadioGroup
//               className="ControllerR"
//               aria-label="data_type"
//               name="data_type"
//               value={cList.dataType.value}
//               onChange={cList.dataType.handler}
//             >
//               <FormControlLabel size='small' value="Daily" control={<Radio />} label="Daily" />
//               <FormControlLabel size='small' value="Hourly" control={<Radio />} label="Hourly" />
//             </RadioGroup>:
//             <RadioGroup
//             className="ControllerR"
//             aria-label="data_type"
//             name="data_type"
//             value={''}
//             >
//               <FormControlLabel size='small' value="Daily" control={<Radio />} label="Daily" disabled/>
//               <FormControlLabel size='small' value="Hourly" control={<Radio />} label="Hourly" disabled/>
//             </RadioGroup>}
//         </FormControl>



//         {/* Map Type Control */}
//         <FormControl className="ControllerSWrapper" size="small">
//           <b className="ControllerHeader">Map Style</b>
//           <Select
//             className="ControllerS"
//             labelId="basemapL"
//             id="basemapS"
//             value={cList.basemap.value}
//             onChange={cList.basemap.handler}
//           >
//             <MenuItem className="ControllerL_M" value="openstreet">Openstreet</MenuItem>
//             <MenuItem className="ControllerL_M" value="cartoDark">Carto Dark</MenuItem>
//             <MenuItem className="ControllerL_M" value="cartoLight">Carto Light</MenuItem>
//             <MenuItem className="ControllerL_M" value="shape">ShapeMap</MenuItem>
//           </Select>
//         </FormControl>


//         {/* Color Scale Control */}
//         {/* <Typography className="ControllerD">
//           ‣ Color Scale
//         </Typography> */}
//         <FormControl className="ControllerSWrapper" size="small">
//           {/* <InputLabel id='cscaleL' className="ControllerL">Color Scale</InputLabel> */}
//           <b className="ControllerHeader">Color Scale</b>
//           <Select
//             className="ControllerS"
//             labelId="cscaleL"
//             id="cscaleS"
//             value={cList.cscale.value}
//             // label="Color Scale"
//             onChange={cList.cscale.handler}
//           >
//             {['viridis', 'inferno', 'turbo', 'rainbow', 'jet', 'hsv', 'hot', 'cool', 'spring', 'summer', 'winter', 'autumn', 'bone', 'copper', 'greys', 'greens',  'bluered', 'rdbu', 'picnic', 'portland', 'blackbody', 'earth', 'electric', 'magma', 'plasma'].map(cs=>{
//               return(<MenuItem className="ControllerL_M" value={cs}>{cs}</MenuItem>)
//             })}
//           </Select>
//         </FormControl>

//         {/* OnOff Layer */}
//         <FormControlLabel 
//           control={<Switch 
//                     checked={!!cList.isSsc.value}
//                     onChange={cList.isSsc.handler}
//                     inputProps={{ 'aria-label': 'CLControl' }}
//                   />} 
//          label="표층 해류 표출"
//          key={'CLControl'}
//          />
//         <FormControlLabel
//           control={<Switch 
//                     checked={!!cList.RLayer.value}
//                     onChange={cList.RLayer.handler}
//                     inputProps={{ 'aria-label': 'RLControl' }}
//                   />} 
//          label="데이터 표출"
//          key={'RLControl'}
//          />

//       </AccordionDetails>
//     </Accordion>
//   );
// }

function ControllerLayer2({controlList}){
  const cList = {...controlList};
  const unit = cList.data.value === 'SST'?'℃':
              cList.data.value === 'chl'?'㎍/L':
              'psu';
  return(
    <ThemeProvider theme={darkTheme}>
    <Drawer
      className="Controller2"
      anchor="left"
      open={cList.controller.value}
      // open={false}
      variant="persistent"
      // variant="permanent"
      sx={{
        flexShrink: 0,
        '& .MuiDrawer-paper': { boxSizing: 'border-box' },
      }}
    >
        {/* Select Data */}
        <div className="ControllerDWrapper">
          <div className="DataImgBtnWrapper">
            <img className="DataImgBtn" src="img/sst.png" alt="sst"/>
            <p>SST</p>
          </div>
          <div className="DataImgBtnWrapper">
            <img className="DataImgBtn" src="img/sss.png" alt="sst"/>
            <p>SSS</p>
          </div>
          <div className="DataImgBtnWrapper">
            <img className="DataImgBtn" src="img/ssh.png" alt="sst"/>
            <p>SSH</p>
          </div>
          <div className="DataImgBtnWrapper">
            <img className="DataImgBtn" src="img/current.png" alt="sst"/>
            <p>Current</p>
          </div>
        </div>

        {/* Select Daily, Hourly Data for SST Data
        <FormControl className="ControllerSWrapper" size="small">
          <b className="ControllerHeader">Data Type</b>
          {cList.data.value === 'SST'?
            <RadioGroup
              className="ControllerR"
              aria-label="data_type"
              name="data_type"
              value={cList.dataType.value}
              onChange={cList.dataType.handler}
            >
              <FormControlLabel size='small' value="Daily" control={<Radio />} label="Daily" />
              <FormControlLabel size='small' value="Hourly" control={<Radio />} label="Hourly" />
            </RadioGroup>:
            <RadioGroup
            className="ControllerR"
            aria-label="data_type"
            name="data_type"
            value={''}
            >
              <FormControlLabel size='small' value="Daily" control={<Radio />} label="Daily" disabled/>
              <FormControlLabel size='small' value="Hourly" control={<Radio />} label="Hourly" disabled/>
            </RadioGroup>}
        </FormControl> */}

        {/* Date Control */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <b className="ControllerHeader">Date</b>
          <DatePicker
            className="ControllerD"
            value={cList.date.value||''}
            onChange={cList.date.handler}
            />
          <TimePicker className="ControllerD" views={['hours']} ampm={false}/>
            {/* {
              cList.dataType.value === 'Hourly'?
              <TimePicker className="ControllerD" views={['hours']} />:
              <TimePicker className="ControllerD" disabled views={['hours']} />
              
            } */}
          </LocalizationProvider>


        {/* Data Control */}
        <FormControl className="ControllerSWrapper" size="small">
          <b style={{'marginTop':'1rem'}} className="ControllerHeader">Data</b>
          <Select
            className="ControllerS"
            labelId="dataL"
            id="dataS"
            value={cList.data.value}
            onChange={cList.data.handler}
          >
            {
              [
                {name:'SST',value:'SST'},
                {name:'SSS',value:'SSS'},
                {name:'Chl_a',value:'chl'},
                {name:'10m_Low_Salinity',value:'10m'}
              ].map(data=>{
                return(<MenuItem className="ControllerL_M" value={data.value}>{data.name}</MenuItem>)
              })
            }
          </Select>
        </FormControl>

        {/* Color Scale bar */}
        <Paper className="ControllerPaper clb">
        {/* <><p className="ColorbarHeader">표층해류 (m/s)</p>
          <Paper className="Colorbar_ssc">
                  <div className='colorbar_num'>
                      {getNumberArray(0.00,2.00).map((data,index)=>(
                          <p key={index}>{data}</p>
                      ))}
                  </div>
          </Paper></> */}

          <><p className="ColorbarHeader">{cList.data.value} ({unit})</p>
          <Paper className="Colorbar">
                  <div className='colorbar_num'>
                      {getNumberArray(cList.display.min,cList.display.max).map((data,index)=>(
                          <p key={index}>{data}</p>
                      ))}
                  </div>
          </Paper></>
        </Paper>

        {/* Style Control */}
        <Paper className="ControllerPaper styb">
          {/* OnOff Layer */}
        {/* <FormControlLabel 
          control={<Switch 
                    checked={!!cList.isSsc.value}
                    onChange={cList.isSsc.handler}
                    inputProps={{ 'aria-label': 'CLControl' }}
                  />} 
         label="표층 해류 표출"
         key={'CLControl'}
         /> */}
        <FormControlLabel
          control={<Switch 
                    checked={!!cList.RLayer.value}
                    onChange={cList.RLayer.handler}
                    inputProps={{ 'aria-label': 'RLControl' }}
                  />} 
         label="데이터 표출"
         key={'RLControl'}
         sx={{'marginBottom':'1rem'}}
         />
          {/* Map Type Control */}
        <FormControl className="ControllerSWrapper" size="small">
          <b className="ControllerHeader">Map Style</b>
          <Select
            className="ControllerS"
            labelId="basemapL"
            id="basemapS"
            value={cList.basemap.value}
            onChange={cList.basemap.handler}
          >
            <MenuItem className="ControllerL_M" value="openstreet">Openstreet</MenuItem>
            <MenuItem className="ControllerL_M" value="cartoDark">Carto Dark</MenuItem>
            <MenuItem className="ControllerL_M" value="cartoLight">Carto Light</MenuItem>
            <MenuItem className="ControllerL_M" value="shape">ShapeMap</MenuItem>
          </Select>
        </FormControl>


        {/* Color Scale Control */}
        {/* <Typography className="ControllerD">
          ‣ Color Scale
        </Typography> */}
        <FormControl className="ControllerSWrapper" size="small">
          {/* <InputLabel id='cscaleL' className="ControllerL">Color Scale</InputLabel> */}
          <b className="ControllerHeader">Color Scale</b>
          <Select
            className="ControllerS"
            labelId="cscaleL"
            id="cscaleS"
            value={cList.cscale.value}
            // label="Color Scale"
            onChange={cList.cscale.handler}
          >
            {['viridis', 'inferno', 'turbo', 'rainbow', 'jet', 'hsv', 'hot', 'cool', 'spring', 'summer', 'winter', 'autumn', 'bone', 'copper', 'greys', 'greens',  'bluered', 'rdbu', 'picnic', 'portland', 'blackbody', 'earth', 'electric', 'magma', 'plasma'].map(cs=>{
              return(<MenuItem className="ControllerL_M" value={cs}>{cs}</MenuItem>)
            })}
          </Select>
        </FormControl>
        </Paper>
        
    </Drawer>
  </ThemeProvider>
  )
}

/**
 * ResultPopup Layer
 * @param {dict} props
 * @returns popup layer
 */
function ResultPopup({...prop}){
  const props = {...prop};

  const [datas,setDatas] = useState([
    {'date':'total','r':'0.68','rr':'-0.17','are':'0.97','ioa':'0.44'},
    {'date':'May','r':'-0.23','rr':'-25.95','are':'0.99','ioa':'0.75'},
    {'date':'June','r':'0.89','rr':'-39.56','are':'0.91','ioa':'-0.25'},
    {'date':'July','r':'-0.15','rr':'-1.33','are':'0.95','ioa':'-0.30'},
    {'date':'August','r':'0.20','rr':'-5.82','are':'0.97','ioa':'-0.01'},
    {'date':'September','r':'0.02','rr':'-3.73','are':'0.98','ioa':'0.55'},
  ]);


  useEffect(()=>{
    if(props.data!=='10m'&&!props.marker.name.includes('이어도')){
      fetch(`/api/result/${props.data}/${props.marker.name}`)
      .then(res=>res.json())
      .then(res=>{
        setDatas(res.result);
        console.log('data',datas);
      });
    }
    else{
      setDatas([
        {'date':'total','r':'0.68','rr':'-0.17','are':'0.97','ioa':'0.44'},
        {'date':'May','r':'-0.23','rr':'-25.95','are':'0.99','ioa':'0.75'},
        {'date':'June','r':'0.89','rr':'-39.56','are':'0.91','ioa':'-0.25'},
        {'date':'July','r':'-0.15','rr':'-1.33','are':'0.95','ioa':'-0.30'},
        {'date':'August','r':'0.20','rr':'-5.82','are':'0.97','ioa':'-0.01'},
        {'date':'September','r':'0.02','rr':'-3.73','are':'0.98','ioa':'0.55'},
      ]);
    }
  },[props.data,props.marker.name])

  return (
    // mui popup
    <Accordion className="ResultPopup">
      <div style={{display:'flex'}}>
      <AccordionSummary className="PopupHeader" expandIcon={<ExpandMoreIcon sx={{color:'#ffffff'}}/>}>
        <Typography className="PopupT">{props.data} 데이터 검증평가 결과</Typography>
      </AccordionSummary>
      <Button className="PopupCloseBtn" size="small" onClick={props.setClose}>X</Button>
      </div>
      <AccordionDetails>
        {/* <TableContainer component={Paper}> */}
        <TableContainer>
          <Table size='small' className="result-table" aria-label="densetable">
            <TableHead>
              <TableRow>
                {
                  ['','R','R^2','ARE','IOA'].map(d=>{
                    return <TableCell align="right">{d}</TableCell>
                  })
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {
                datas.map((d,id)=>(
                  // console.log(d)
                  <TableRow key={id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{d.date}</TableCell>
                    <TableCell align="right">{d.r}</TableCell>
                    <TableCell align="right">{d.rr}</TableCell>
                    <TableCell align="right">{d.are}</TableCell>
                    <TableCell align="right">{d.ioa}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );

}


const chartData = [
  {
    name: "Model_output",
    data: [32.25,32.24,32.20,32.48,32.47,32.26,32.39,32.48,32.33,32.36,32.49,32.39,32.48,32.62,32.41,32.50,32.21,32.33,32.33,32.25,32.42,32.36,32.35,32.17,32.39,32.60,32.35,32.11,32.13,32.27,32.27,32.27,32.20,32.03,32.30,31.85,31.78,32.08,32.25,32.44,32.29,31.87,31.51,30.81,32.55,32.41,31.89,31.11,30.56,30.59,29.66,30.16,30.26,30.18,30.38,29.91,29.52,29.53,29.49,29.39,30.16,30.25,30.09,29.96,29.97,29.99,30.07,29.77,29.10,29.33,29.26,29.08,28.36,28.24,28.70,29.03,28.24,28.29,29.04,29.23,29.27,29.87,30.88,31.41,31.19,30.33,29.58,29.67,29.73,29.67,29.56,29.52,29.54,29.49,29.44,29.29,29.32,29.23,29.87,29.41,29.76,29.21,29.18,29.10,29.53,29.76,30.69,30.53,30.17,29.92,31.17,30.29,30.72,31.33,31.26,30.93,31.12,30.89,30.84,30.81,30.91,31.19,31.16,31.51,31.99,31.06,31.06,31.21,31.33,31.29,31.68,31.68,32.14,32.31,32.25
    ]
  },
  {
    name: "obs",
    data: [32.27,32.25,32.21,32.15,32.16,32.17,32.17,32.19,32.18,32.18,32.16,32.15,32.13,32.15,32.22,32.22,32.19,32.2,32.18,32.12,32.05,32.11,32.12,32.1,32.12,32.11,32.15,32.16,32.17,32.19,32.2,32.25,32.28,32.22,32.24,32.24,32.24,32.29,32.28,32.27,32.25,32.12,32.12,32.14,32.21,32.13,31.96,31.86,31.83,31.8,31.74,31.81,31.89,31.92,31.91,31.89,31.89,31.81,31.79,31.79,31.74,31.45,31.18,31.03,30.93,30.77,30.79,30.69,30.78,30.66,30.47,30.3,30.51,30.35,30.17,30.13,30.15,30.2,29.27,28.74,28.7,28.27,28.38,28.96,29.41,29.7,29.72,29.61,29.57,29.52,29.53,29.93,30.24,30.14,30.45,30.78,31.1,31.24,31.24,31.27,31.27,31.19,31.2,31.18,30.84,30.82,30.74,30.77,30.79,30.84,31.36,31.26,31.21,31.13,30.97,30.87,30.82,30.86,30.93,30.95,31.11,31.31,31.28,31.38,31.69,32,31.96,32.01,31.94,31.91,31.88,31.85,31.78,31.77,31.82
    ]
  }
]

const chartDate = ['20-05-01','20-05-02','20-05-03','20-05-04','20-05-05','20-05-06','20-05-07','20-05-08','20-05-09','20-05-10','20-05-11','20-05-12','20-05-13','20-05-14','20-05-15','20-05-16','20-05-17','20-05-18','20-05-19','20-05-20','20-05-21','20-05-22','20-05-23','20-05-24','20-05-25','20-05-26','20-05-27','20-05-28','20-05-29','20-05-30','20-05-31','20-06-01','20-06-02','20-06-03','20-06-04','20-06-05','20-06-06','20-06-07','20-06-08','20-06-09','20-06-10','20-06-11','20-06-12','20-06-13','20-06-14','20-06-15','20-06-16','20-06-19','20-06-20','20-06-21','20-06-22','20-06-23','20-06-24','20-06-25','20-06-26','20-06-27','20-06-28','20-06-29','20-06-30','20-07-01','20-07-02','20-07-03','20-07-04','20-07-05','20-07-06','20-07-07','20-07-08','20-07-09','20-07-10','20-07-11','20-07-12','20-07-13','20-07-14','20-07-15','20-07-16','20-07-17','20-07-18','20-07-19','20-07-20','20-07-21','20-07-22','20-07-23','20-07-24','20-07-25','20-07-26','20-07-27','20-07-28','20-07-29','20-07-30','20-07-31','20-08-01','20-08-02','20-08-03','20-08-04','20-08-05','20-08-06','20-08-07','20-08-08','20-08-09','20-08-10','20-08-11','20-08-12','20-08-13','20-08-14','20-08-15','20-08-16','20-08-17','20-08-18','20-08-19','20-08-20','20-08-21','20-08-22','20-08-23','20-08-24','20-08-25','20-08-26','20-08-27','20-08-28','20-08-29','20-08-30','20-08-31','20-09-01','20-09-02','20-09-04','20-09-05','20-09-06','20-09-07','20-09-08','20-09-09','20-09-10','20-09-11','20-09-12','20-09-13','20-09-14','20-09-15']

const chartOptions ={
    chart: {
    height: 350,
    type: 'line',
    dropShadow: {
      enabled: true,
      color: '#000',
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.2
    },
    toolbar: {
      show: false
    }
  },
  colors: ['#77B6EA', '#BDBDBD'],
  // dataLabels: {
  //   enabled: true,
  // },
  stroke: {
    curve: 'smooth'
  },
  title: {
    align: 'left',
    style:{
      color:'#ffffff',
    }
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      // colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  // markers: {
  //   size: 1
  // },
  xaxis: {
    categories: chartDate,
    // range: ,
    title: {
      text: 'Date',
    },
    labels:{
      style:{
        colors:'#ffffff'
      },
      // show : false,
    }
  },
  legend: {
    position: 'top',
    labels:{
      colors:'#ffffff'
    },
    horizontalAlign: 'right',
    floating: true,
    offsetY: -25,
    offsetX: -5
  }
}



/**
 * Time Series Layer
 * @param {dict} props
 * @returns popup layer
 */
function TimeSeriesPopup({...prop}){
  const props = {...prop};
  return(
    <Paper className="TSPopup">
      <div className="PopupHeaders">
        <b className="PopupHeader">{props.marker.name} ({props.marker.position[0].toFixed(2)} N, {props.marker.position[1].toFixed(2)} E)</b>
        <Button className="PopupCloseBtn" size="small" onClick={props.setClose}>X</Button>
      </div>
      <div className="PopupContents">
        <ReactApexChart
          options={{...chartOptions,title:{text:props.data,align: 'left',
          style:{
            color:'#ffffff',
          }}}}
          series={chartData}
        />
      </div>
    </Paper>
  )
}


export { GeotiffLayer, PlottyGeotiffLayer, VectorArrowsGeotiffLayer,BasemapControlLayer, ResultPopup,TimeSeriesPopup, ControllerLayer2};