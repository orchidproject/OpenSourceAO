var playerIconSize = new google.maps.Size(32, 32);
var playerIconOrigin = new google.maps.Point(0,0);
var playerIconAnchor = new google.maps.Point(16, 32);
var playerIcons = {
	blue: new google.maps.MarkerImage("/img/blue_dot.png", new google.maps.Size(16, 16), playerIconOrigin, new google.maps.Point(8, 8))
}

var taskIcon1 = "task_icon1";
var taskIcon2 =  "task_icon2";
var taskIcon3 =  "task_icon3";
var taskIcon4 = "task_icon4";


var medic = "/img/medic.png";
var soldier =  "/img/soldier.png";
var ambulance =  "/img/firefighter.png";
var transporter = "/img/convertible.png";
var uav = "/img/plane.png";
var tick = "/img/tick.png";

var chosen_task_type = 0;

var cg = {
	s: function(w,h) {
		return new google.maps.Size(w,h);
	},
	p: function(w,h) {
		return new google.maps.Point(w,h);
	},
	playerImage: function(name, skill) {
		return new google.maps.MarkerImage("/player/"+name[0]+"/"+name[1]+"/"+skill+"/map_icon.png", new google.maps.Size(30 , 30), new google.maps.Point(0,0), new google.maps.Point(10, 30), new google.maps.Size(30 , 30));
	},
	imageSrc: function(name, skill) {
		return "/player/"+name[0]+"/"+name[1]+"/"+skill+"/map_icon.png";
	},
	large_number: function(number){
		return new google.maps.MarkerImage("/img/large_number/" + number + ".png", new google.maps.Size(30, 30), new google.maps.Point(0,0), new google.maps.Point(10, 30), new google.maps.Size(30 , 30));

	}
	
};

function getPlayerIcon(initials, skill) {

    var icon = cg.playerImage(initials,skill);
	
	return icon;
}

var highlightMarker=null;

function setHighlightPosition(loc) {
	if(highlightMarker==null) {
		highlightImage = "/img/dot-sprite.png";
		highlightMarkerIcon = new google.maps.MarkerImage(highlightImage, playerIconSize, playerIconOrigin, playerIconAnchor);
        highlightMarker = {
	            id: 9999,
	            name: "my_marker",
	            marker: new google.maps.Marker({
	                position: loc,
	                map: map,
	                icon: highlightMarkerIcon,
	                visible: true
	            })
	        };

	}
	
	//highlightMarker.setPosition(loc);
	//now centre the map around me
	//centreMap(loc);
}

function centreMap(loc) {
	$('#map').setCentre();
}


/**
TASK ICONS... 
*/

function receiveDropoffpointData(drop){
	point = new google.maps.LatLng(drop.latitude,drop.longitude);
                	
        var circle = new google.maps.Circle({
				center:point,
  				map: map,
  				radius: drop.radius,    
  				fillColor: '#0000FF',
  				strokeColor: '#0000FF',
  				clickable: false
		});

	var marker =  new google.maps.Marker({
				position: point,
				map:map, 
				icon:cg.large_number((drop.id%10))
	});
}

function drawInstruction(pid,tid){
	if(players[pid]!=null){
		var p = players[pid];
		var lat = p.marker.getPosition().lat();	
		var lng = p.marker.getPosition().lng();
		if(p.previous_path!=null){
			p.previous_path.setMap(null);
		} 
		if (tid == -1){
			return;	
		}

		var t = findTaskById(tid);
		var lat2 = t.marker.getPosition().lat();	
		var lng2 = t.marker.getPosition().lng();	
		var flightPlanCoordinates = [
		      new google.maps.LatLng(lat, lng),
		      new google.maps.LatLng(lat2, lng2),
		  ];
		  var flightPath = new google.maps.Polyline({
		    path: flightPlanCoordinates,
		    strokeColor: '#FFFF00',
		    strokeOpacity: 1.0,
		    strokeWeight: 4 
		  });

		  p.previous_path = flightPath;
		  flightPath.setMap(map);
	}
}
var tasks = [];
function receiveTaskData(task){
	//ignore invisible task
	if(task.state == 4){
		return ;
	}


	var existing_task=null;
	for (i=0;i<tasks.length;i++) {
		if (tasks[i].id==task.id){
			existing_task=tasks[i];
		}
	}
		
	if(existing_task==null){
			
		var taskIcon= getTaskIcon(task.type,task.id);
		var point = new google.maps.LatLng(task.latitude,task.longitude);
		if (task.state==2){
			taskIcon=new google.maps.MarkerImage(tick, playerIconSize, playerIconOrigin, playerIconAnchor);
		}
		var drag = false;
		if(test!=null&&test){
			drag=test;
		}	
    		var marker = new google.maps.Marker({
                	position: point,
                	map: map,
                	icon: taskIcon,
			draggable:drag
        	});
        
        	var the_task={id:task.id,state: task.state, marker:marker};
        
        	tasks.push(the_task);
		if(test!=null&&test){
			setupTaskTest(the_task);
		}
        }
        else{
        	var new_postion = new google.maps.LatLng(task.latitude,task.longitude);
        	existing_task.marker.setPosition(new_postion);
		existing_task.state = task.state;
        	
        	if (task.state==2){
				var taskIcon=new google.maps.MarkerImage(
					tick, 
					playerIconSize, 
					playerIconOrigin, 
					playerIconAnchor
				);
				existing_task.marker.setIcon(taskIcon);
		}

	        else if(task.state != 2 && ((test!=null&&test)||(replay!=null&&replay))){
			var taskIcon= getTaskIcon(task.type,task.id);
			existing_task.marker.setIcon(taskIcon); 
		}

        }
        
       
        //handle task status
        handleTaskStatus(task);
       
}


function getTaskImage(task_type) {
	var imageURL = ""
	if (task_type == 0) {
		imageURL = taskIcon1; 
	}
	else if (task_type == 1) {
		imageURL = taskIcon2;
	} else if (task_type == 2) {
		imageURL = taskIcon3;
	}
	else if (task_type == 3) {
		imageURL = taskIcon4;
	}
	
	
	return imageURL;
}

 
function getTaskIcon(task_type,task_id) {

	var imageURL=getTaskImage(task_type);
	//var initials = String.fromCharCode(65 + task_id/26) + String.fromCharCode(65+ task_id%26); 	
	var initials = (Math.floor((task_id/10)%10) + "" + task_id%10); 	
        var icon = cg.playerImage(initials,imageURL);  
	return icon;
}

//SHOULD BE LOCATION DATA???////
function receivePlayerData(data) {
	var markerIcon;
		
	var userID=$("#user_id").val();
		
	var pid = data.player_id;
		
		
	if (userID!=pid){
		markerIcon = getPlayerIcon(data.initials,data.skill);
	}else{
		//an icon for player itself
		markerIcon = playerIcons.blue;
	}
		
		
	if(typeof players[pid] == "undefined") {
		var drag = false;
		if(test!=null&&test){
				drag = test;
		}

		players[pid] = {
		            id: pid,
		            skill: data.skill,
		            initials: data.initials,
		            name: data.name,
		            marker: new google.maps.Marker({
		                position: new google.maps.LatLng(data.latitude, data.longitude),
		                map: map,
				draggable: drag,
		                icon: markerIcon,
		                visible: true 
		            })
		};
			
		if(test!=null&&test){
			setupTest(pid);
		}
	
	} else {
		//update 
		var p = players[pid];
		p.marker.setPosition(new google.maps.LatLng(data.latitude, data.longitude)); 

		if(test!=null&&test){
			p.marker.setIcon(markerIcon);
		}

		if((typeof replay != undefined)&&replay){ 
			if(p.instruction!=null){
				drawInstruction(p.id,p.instruction.task);
			}	
		}
	}	
		
}




var GameMap = {
	fitToRadius: function(radius) {
	  var center = map.getCenter();
	  var topMiddle = google.maps.geometry.spherical.computeOffset(center, radius, 0);
	  var bottomMiddle = google.maps.geometry.spherical.computeOffset(center, radius, 180);
	  var bounds = new google.maps.LatLngBounds();
	  bounds.extend(topMiddle);
	  bounds.extend(bottomMiddle);
	  map.fitBounds(bounds);
	}
}


//new model based implementation
function drawTask(task){
	//dynamic attribute including location and task state
	//state = 1:active 2:inactive
	var taskIcon;
	var point = new google.maps.LatLng(task.latitude,task.longitude);
		
	if (task.state==2){
		taskIcon = new google.maps.MarkerImage(tick, playerIconSize, playerIconOrigin, playerIconAnchor);
	}
	else{
		taskIcon = getTaskIcon(task.type,task.id); 

	}	
	
	if (task.marker == null){
     		task.marker = new google.maps.Marker({
                	position: point,
                	map: map,
                	icon: taskIcon
        	});
       
        }
        else{
        	task.marker.setPosition(taskIcon);
        }
}

function drawDpZone(dpZone){
	//dpzone is static
	point = new google.maps.LatLng(dpZone.latitude,dpZone.longitude);
        if(dpZone.marker == null){        	
		dpZone.marker = new google.maps.Circle({
				center:point,
  				map: map,
  				radius: dpZone.radius,    
  				fillColor: '#0000FF',
  				strokeColor: '#0000FF',
  				clickable: true 
		});
	}

}
