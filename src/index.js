const express = require('express');

const bodyParser = require('body-parser');
const apiRoutes = require('./routes/index');
const app = express();
const db = require('./models/index');
const {PORT , FLIGHT_SERVICE_PATH , DB_SYNC} = require('./config/serverConfig');
const setupAndeStartServer = ()=>{
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended : true}));

    app.use('/api' , apiRoutes);
    app.listen(PORT , ()=>{
        console.log(`server is started on port ${PORT}`);

        if(process.env.DB_SYNC){
            db.sequelize.sync({alter : true});
        }        
        //console.log(typeof FLIGHT_SERVICE_PATH);
    })
}

setupAndeStartServer();