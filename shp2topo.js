var fs = require('fs');
var shapefile = require('shapefile');
var topojson = require('topojson-server');

// specify the input file here
const inputFile = 'g2g20.shp'
// specify the output file here
const outputFile = 'geo.json'

shapefile
  .open(inputFile)
  .then(source => {
    // start with empty geojson skeleton
    let geojson = {
      type: 'FeatureCollection',
      features: [] // into this array we push our features below
    }
    return source.read().then(function log (result) {
      // when done: pass geojson to next function in promise pipeline
      if (result.done) return geojson

      // if not done: add to geojson feature by feature
      const feature = {
        //destructuring assignment : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        ...result.value,
        // keep from properties only the bfs id
        properties: {
          bfs_id: result.value.properties.GMDNR
        }
      }
      geojson.features.push(feature)
      // continue with next feature/iteration
      return source.read().then(log)
    })
  })
  // just before write to file add the following line:
  .then(geojson => 
    //topojson.topology({ municipalities: geojson })
    topojson.topology({ municipalities: geojson }, 1000)      //1000 : Quantization -> die Koordinaten werden als Punkte eines definierten Grids interpretiert und NICHT als beliebiger Float
  )
  // write to file
  .then(fileContent =>
    fs.writeFile(outputFile, JSON.stringify(fileContent), () => { 
      console.log('The file has been saved!')
    })
  )
  .catch(console.error)