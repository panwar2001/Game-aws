import express from "express";
const port = process.env.PORT || 3000;

const app: express.Application = express()
app.use((_, res, next)=>{
        res.header("Access-Control-Allow-Origin", "*");         
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");         
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        next();
    });           
app.route('').post(()=>{

})
app.listen(port, () => {
    console.log(`Express server listening on port ${port}!`);
})
