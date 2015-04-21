/*
This is a virtual agent template
usage:

node agent.js [game_id]

it moves an agent along a fix route

*/

var events = require('events');
var RUBY_PORT = 49992;
var game_id=process.argv[2];

var Helper = require('./agent_helper');
var helper = new Helper(game_id);
// get a socket io connection to server
var socket = helper.getSocket();

//logout of game when the pragram terminates
var stdin = process.openStdin();
process.on('SIGINT', function () {
  process.exit(0);
});

var SOCKET_IO_ADDRESS = helper.socketAddress;
var NODE_JS_ADDRESS = helper.nodeAddress;
var RUBY_ADDRESS = helper.rubyAddress;


//handlers and main loop
var game_playing=false;
var truckUpdateID;

function setHandler(){

    //act on events
    socket.on('data', function(data) {
        if(typeof data.system != "undefined"){
            if(data.system == "end"){
                game_playing=false;
                clearInterval(truckUpdateID);
            }
        }
        
        if(typeof data.player != "undefined"){
            //receivePlayerData(data.player);
        }
        
        if(typeof data.textMassage != "undefined"){
            //receiveTextMassage(data.textMassage);
        }
        
        if(typeof data.location != "undefined"){
            //receiveLocationData(data.location);
        }
        
        if(typeof data.request != "undefined"){
            //receiveRequestData(data.request);
        }
        
        if(typeof data.reading != "undefined"){
               // receiveReadingData(data.reading);
        }
            
        if(typeof data.cargo != "undefined"){
                //receiveCargoData(data.cargo);
        }
        
        if(typeof data.cleanup != "undefined"){
                //cleanup(data.cleanup);
        }
    
    });
    
}


function mainloop(){    
    //push location to server ever half second
    truckUpdateID=setInterval(updateTruckLocation, 500);
    
    //set initial postion
    helper.player.lat=52.950978;
    helper.player.lng=-1.186287;
                

    //move a truck along a path
    //var path=[helper.player,helper.pointSet.p1,helper.pointSet.t1,helper.pointSet.p1,helper.pointSet.p0, //go get t1
    //helper.pointSet.p1,helper.pointSet.t1,helper.pointSet.p2,helper.pointSet.p3,helper.pointSet.t2,helper.pointSet.p0,helper.pointSet.p4];
    var path= [{lat:52.950978,lng:-1.186287},{lat:52.951246,lng:-1.1844},{lat:52.950978,lng:-1.186287}]; 
    var section=0;
    
    //go along next section when previous section finished
    event.on('section-finish', function(){
        console.log(section+" section finish");
        if (section<path.length-1){
            moveTruck(path[section],path[section+1]);
            section++;
	    console.log("swithch section");
        }
        else{
            section=0;
            moveTruck(path[section],path[section+1]); 
		console.log("final section"); 
        }
    });
    moveTruck(path[section],path[section+1]);
    
}


function updateTruckLocation(){
    socket.emit('location-push',{"player_id":helper.player.user_id,"latitude":helper.player.lat,"longitude":helper.player.lng,"skill":helper.player.skill,"initials":helper.player.initials});
}

/////////////////////////////
//this code control movement of truck
/////////////////////////////


var previousMoveId=0;
var count=0;
var lngPerStep;
var latPerStep;
var steps;


var MoveEvent=function MoveEvent(){};
MoveEvent.prototype=new events.EventEmitter;
var event= new MoveEvent;

function moveTruck(ori,des){
    var speed = 3; //5 m/s
    
    helper.api('GET','/agent_utility/distance_between',{lat1:ori.lat,lng1:ori.lng,lat2:des.lat,lng2:des.lng},function(res){
        
        if (res.distance==null){
            return;
        }
        console.log(res.distance);
        //supposed to be finished within distance/speed sec
        var time = res.distance*1000/speed;
        //time interval for each small movement is 0.1 sec, so the whole movement should be finished within time*10 steps
        steps= time*10;
    
        lngPerStep = (des.lng-ori.lng)/steps;
        latPerStep = (des.lat-ori.lat)/steps;
        count=0;
    
    
        clearInterval(previousMoveId);
        previousMoveId = setInterval(moveOneStep,100);
    });

}

function moveOneStep() {
        if(count<steps){
            helper.player.lat=helper.player.lat+latPerStep;
            helper.player.lng=helper.player.lng+lngPerStep;
            
            //console.log(helper.player.lat+","+helper.player.lng);
            count++;
        
        }
        else{
            clearInterval(previousMoveId);
            
            //notify that a section has be completed
            event.emit('section-finish');
        }
        
}

//join game
helper.join('agent','a@agent.com','truck',3,'AA', function(p){
    
    
    if (p.user_id != null){
        //wait for starting signal 
        /*console.log("wait for starting signal ");
        
        socket.on('data', function(data) {
            if(data.system == "start"){
                game_playing=true;
                console.log("start playing");
                
                
            }
        });*/
        
        //initialize
        helper.player=p;
        setHandler();
        mainloop();
        
        //console.log("game join successful");
    }
    console.log(p);
});

