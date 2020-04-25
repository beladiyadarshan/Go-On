// import JsSearch from './JSsearch';
var lives;
var socket;
var link1;
var tag;
//const fs = require('fs');
$(document).ready(function() {
    //console.log(link1[])
    $.ajax({
        url: "https://geolocation-db.com/jsonp",
        jsonpCallback: "callback",
        dataType: "jsonp",
        success: function (location) {
          console.log(location);
          tag=location
        }
      });
    connectSocket('username', 'password');
  });


$('#showl1').click(function(){
    console.log("11111222222222222222");
    show12();
})

$('#thnearby').click(function(){
    
    

    const ordered = {};
    Object.keys(link1).sort((a,b)=>{
        // console.log(a+" "+b);
        var A = a.split("$");
        var B = b.split("$");
        var x = parseFloat( A[0] );
        var y = parseFloat( A[1] );

        var p = parseFloat( B[0] );
        var q = parseFloat( B[1] );


        var nx = parseFloat( tag['latitude'] );
        var ny = parseFloat( tag['longitude'] );


        var dist1 = parseFloat( (nx-x)*(nx-x) + (ny-y)*(ny-y) );
        var dist2 =  parseFloat( (nx-p)*(nx-p) + (ny-q)*(ny-q) );
        console.log(dist1+"  "+dist2);
        console.log(a+" "+b)
        console.log(x+" "+y+" "+p+" "+q)
        if(dist1 < dist2)
        {
            return -1;
        }
        else if(dist1 > dist2)
            return 1;
        else
            return 0;

    }).forEach(function(key) {
    ordered[key] = link1[key];
    });
    console.log(ordered)
    showThumb(ordered);


});

$('#nearby').click(function(){
    
    

    const ordered = {};
    Object.keys(lives).sort((a,b)=>{

        var x = parseFloat( lives[a].tags['latitude'] );
        var y = parseFloat( lives[a].tags['longitude'] );

        var p = parseFloat( lives[b].tags['latitude'] );
        var q = parseFloat( lives[b].tags['longitude'] );


        var nx = parseFloat( tag['latitude'] );
        var ny = parseFloat( tag['longitude'] );


        var dist1 = parseFloat( (nx-x)*(nx-x) + (ny-y)*(ny-y) );
        var dist2 =  parseFloat( (nx-p)*(nx-p) + (ny-q)*(ny-q) );
        console.log(dist1+"  "+dist2);
        console.log(a+" "+b)
        console.log(x+" "+y+" "+p+" "+q)
        if(dist1 < dist2)
        {
            return -1;
        }
        else if(dist1 > dist2)
            return 1;
        else
            return 0;
        
        

    }).forEach(function(key) {
    ordered[key] = lives[key];
    });
    console.log(ordered)
    updateListOfRooms(ordered);


});

// Search logic goes hrere...

$('#search').click(function(){
    var q = $('#query').val();
    console.log(lives)
    var len = lives.length
    var result = {} 
    var keys = Object.keys(lives);
    var cnt = 0;
    keys.forEach(function(roomid, idx) {
        // console.log(roomid)
        var f2=1;
        var f=1;
        var f1=1;
        var room = lives[roomid];
        // console.log(room)
        var desc=lives[roomid].desc;
        Object.keys(room.tags || {}).forEach(function(key) {
            // console.log(room.tags[key])
            
            if(room.tags[key] === q)
            {
                // var x = {roomid : room}
                result[roomid.toString()] = room;
                var x= roomid
                // Object.assign(result, {[roomid]: room});
                f=0;
                cnt++;
            }
        });
        if( roomid === q)
        {
            // console.log('h');
            result[roomid.toString()] = room;
            f1=0;
            cnt++;
        }

        // Naive string matching algorithm.
        var M = q.length;
        // console.log(desc) 
        var N = desc.length; 
        var c=0;
        var fmax  = 0;
        for (var i = 0; i <= N - M; i++) { 
            var j; 
            var fq = 0;
            for (j = 0; j < M; j++) 
            {
                if (desc[i + j] == q[j] || (desc.charCodeAt(i + j) - q.charCodeAt(j)) == 32 || (q.charCodeAt(j) - desc.charCodeAt(i + j)) == 32)
                {
                    fq++;
                }
                else
                    break;
                
                if (j == M) 
                {
                    c++;
                }
            }
            if(fmax < fq)
            fmax = fq;
        } 
        if(c != 0)
        {
            f2=0;
            cnt++;
            result[roomid.toString()] = room;
        }// allow 30% mistake in search keyword...
        else if(fmax/q.length >= 0.7)
        {
            f2=0;
            cnt++;
            result[roomid.toString()] = room;
        }
    })
    
    // console.log(q)
    if(cnt != 0)
    {
        document.getElementById("xy").innerHTML = cnt + " live video/videos found !!"
        updateListOfRooms(result);
    }
    else
    {
        document.getElementById("xy").innerHTML = "No live videos found !!"
        updateListOfRooms(lives);        
    }
   
});
// Search logic for thumbnail goes hrere...
$('#thsearch').click(function(){
    var q = $('#thquery').val();
    console.log(link1)
    var result = {} 
    var keys = Object.keys(link1);
    var cnt = 0;
    keys.forEach(function(roomid, idx) {
        // console.log(roomid)
        var f2=1;
        var f=1;
        var f1=1;
        var room = link1[roomid];
        // console.log(room)
        var d = room.split("$");
        var desc= d[2];
        
        // Naive string matching algorithm.
        var M = q.length;
        // console.log(desc) 
        var N = desc.length; 
        var c=0;
        var fmax  = 0;
        console.log(q+" "+desc)
        for (var i = 0; i <= N - M; i++) { 
            var j; 
            var fq = 0;
            for (j = 0; j < M; j++) 
            {
                
                if (desc[i + j] == q[j] || (desc.charCodeAt(i + j) - q.charCodeAt(j)) == 32 || (q.charCodeAt(j) - desc.charCodeAt(i + j)) == 32)
                {
                    fq++;
                }
                else
                    break;
                
                if (j == M) 
                {
                    c++;
                }
            }
            if(fmax < fq)
            fmax = fq;
        } 
        if(c != 0)
        {
            f2=0;
            cnt++;
            result[roomid.toString()] = room;
        }// allow 30% mistake in search keyword...
        else if(fmax/q.length >= 0.7)
        {
            f2=0;
            cnt++;
            result[roomid.toString()] = room;
        }
    })
    
    // console.log(q)
    if(cnt != 0)
    {
        document.getElementById("thxy").innerHTML = cnt + " video/videos found !!"
        showThumb(result);
    }
    else
    {
        document.getElementById("thxy").innerHTML = "No videos found !!"
        show12();    
    }
   
});

$('.close-admin-credentials-box').click(function() {
    location.reload();
});

$('#btn-validate-admin').click(function() {
    var adminUserName = $('#txt-admin-username').val();
    var adminPassword = $('#txt-admin-password').val();

    if(!adminUserName || !adminPassword || !adminUserName.replace(/ /g, '').length || !adminPassword.replace(/ /g, '').length) {
        alertBox('Admin username and password is required.', 'Invalid Credentials', null, function() {
            location.reload();
        });
        return;
    }

    $('#btn-validate-admin').html('Please wait...').prop('disabled', 'disabled').addClass('disabled');

    connectSocket(adminUserName, adminPassword);
});

setTimeout(function() {
    $('#txt-admin-username').focus();
}, 500);

function connectSocket(username, password) {
    console.log("1111");
    socket = io.connect('/?userid=admin&adminUserName=' + username + '&adminPassword=' + password);
    socket.on('lives',function(message){
        //console.log(message);
    })
    socket.on('admin', function(message) {
        
        console.log(message);
        if(message.error) {
            alertBox(message.error, 'Invalid Credentials', null, function() {
                location.reload();
            });
            return;
        }

        if(message.connected === true) {
            // $('#adminPasswordModel').modal('hide');
            return;
        }

        socket.isAdminConnected = true;

        if (message.newUpdates === true) {
            if (socket.auto_update === true) {
                socket.emit('admin', {
                    all: true
                });
                return;
            }
            $('.new-updates-notifier').show();
        } else {
            //data123456
            console.log(message);
                lives = message.listOfRooms;
                link1=message.link1;
            updateListOfRooms(message.listOfRooms || []);
            // updateListOfUsers(message.listOfUsers || []);
        }

        $('#active-users').html(message.listOfUsers || 0);
        $('#scalable-users').html(message.scalableBroadcastUsers || 0);
        // $('#all-sockts').html(message.allSockets || 0);
    });
    $('.new-updates-notifier a').click(function(e) {
        e.preventDefault();
        $('.new-updates-notifier').hide();
        socket.emit('admin', {
            all: true
        });
    });
    $('.new-updates-notifier input').click(function() {
        socket.auto_update = true;
        $('.new-updates-notifier a').click();
    });
    socket.on('connect', function() {
        socket.emit('admin', {
            all: true
        });
    });
    socket.on('disconnect', function() {
        if(socket.isAdminConnected === true) {
            location.reload();
        }
    });
}

function updateListOfUsers(listOfUsers) {
    $('#active-users').html(listOfUsers.length);

    $('#users-list').html('');

    if (!listOfUsers.length) {
        $('#users-list').html('<tr></tr>');
        return;
    }

    listOfUsers.forEach(function(user, idx) {
        var tr = document.createElement('tr');
        var html = '';

        html += '<td><span>' + (idx + 1) + '</span></td>';
        html += '<td><span class="clickable max-width" data-userid="' + user.userid + '" title="' + user.userid + '">' + user.userid + '</span></td>';
        html += '<td><span class="max-width" title="' + user.admininfo.sessionid + '">' + user.admininfo.sessionid + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.session || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.session) + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.extra || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.extra) + '</span></td>';

        if (true) {
            // stream-ids
            html += '<td>';
            html += '<table>';
            html += '<thead>';
            html += '<th>streamid</th>';
            html += '<th>tracks</th>';
            html += '</thead>';
            html += '<tbody>';

            (user.admininfo.streams || []).forEach(function(stream) {
                html += '<tr>';
                html += '<td class="max-width" title="' + stream.streamid + '">' + stream.streamid + '</td>';
                html += '<td>' + stream.tracks + '</td>';
                html += '</tr>';
            });
            html += '</tbody>';
            html += '</table>';
            html += '</td>';
        }

        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.mediaConstraints || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.mediaConstraints) + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.sdpConstraints || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.sdpConstraints) + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.connectedWith || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.connectedWith) + '</span></td>';

        // html += '<td><button class="btn delete-user" data-userid="' + user.userid + '">Delete</button></td>';
        $(tr).html(html);
        $('#users-list').append(tr);

        $(tr).find('.clickable').click(function() {
            $('#txt-userid').val($(this).attr('data-userid'));
            $('#view-userinfo').click();
        });

        $(tr).find('.delete-user').click(function() {
            var userid = $(this).attr('data-userid');
            confirmBox('User "<b>' + userid + '</b>" will be deleted from server.', function(isConfirmed) {
                if (!isConfirmed) return;

                socket.emit('admin', {
                    deleteUser: true,
                    userid: userid
                }, function(isDeleted) {
                    if (isDeleted) {
                        $('.bd-example-modal-lg').modal('hide');

                        socket.emit('admin', {
                            all: true
                        });
                    } else {
                        alertBox('Unable to delete this user.', 'Can Not Delete');
                    }
                });
            });
        });
    });
}


function updateListOfRooms(rooms) {
    var k1=Object.keys(link1);
    console.log(link1['name']);
    console.log(rooms);
    k1.forEach(function(r){
        console.log(link1[r]);
    });
    var keys = Object.keys(rooms);
    $('#active-rooms').html(keys.length);
    
    $('#rooms-list').html('');

    if (!keys.length) {
        $('#rooms-list').html('');
        return;
    }

    keys.forEach(function(roomid, idx) {
        var room = rooms[roomid];
        var tr = document.createElement('div');
        var html = '<div class="card ';

        if(idx%2==0)
        {
            html+='green';
        }

        html+='"><div class="additional"><div class="user-card"><div class="level center">';

        html += '' + (idx + 1) + '</div>';
        html += '<div class="points center">';

        var l1="/admin/show.html?id+"+roomid;
        html += '<button class="btn delete-room" id="b" data-roomid="' + roomid + '">show</button></div></div>';



       


       html += '<div class="more-info">';
       html+='<h5 style="color:#FCEEB5;padding-top:0px;">Tags</h5><div style="color:teal; padding-left:20px;font-size:13px;">';
       var i=0;
       html+='';
       var i=0;
        Object.keys(room.tags || {}).forEach(function(key) {
            
            html += '<b>' + key + ':</b>' + room.tags[key];



            i=i+1;
            if(i%2==0)
            {
                html+='</br>';

            }
            else
            {
                 html+= '&nbsp;||&nbsp;'
            }


        });

        html+='</div></div></div>'
        html+='<div class="general"><h4 style="color:blue;padding-top:8px;">';
       html+=''+roomid+'<div style="height:35px;"></div>';
       html+=''+room.desc+'</h4>';
        html+='<span class="more" style="paading-right:30px;font-size:20px;"><i class="fa fa-eye" style="font-size:18px;margin-bottom:-5px;"></i>&nbsp;'
        html+=room.participants.length;

        html+='</b></span>';
        html+='</div></div>';


      
      
       

       
       
       
       
        
        //html += '<td><a class="btn delete-room" id="b" href='+l1+'>show</a></td>';
        $(tr).html(html);
        $('#rooms-list').append(tr);

        

        $(tr).find('.delete-room').click(function() {
            var roomid = $(this).attr('data-roomid');

            location.replace("/admin/show.html?id="+roomid);
        });
    });
}

function showThumb(data){
    jQuery('#show-list').html('');
    $('#show-list').append('<br>'); 
    var k1=Object.keys(data);
    var ii=0;
    k1.forEach(function(r){
        console.log(r);
        // html+='<a href="/uploads/"'+r+'">'+r+'</a><br>';
        var p1='/uploads/'+r;
        var li=document.createElement('li');

        var a=document.createElement('a');
        var s=r;
        var d=s.split("$");
        var link = document.createTextNode(d[2]); 
        a.appendChild(link);  


        a.title = link;   
        a.href = p1;  

        ii=ii+1;

        if(ii%5==0)
        {
        a.style.color="blue";
        }
        if(ii%5==1)
        {
        a.style.color="green";
        }if(ii%5==2)
        {
        a.style.color="red";
        }if(ii%5==3)
        {
        a.style.color="teal";
        }if(ii%5==4)
        {
        a.style.color="orange";
        }
        a.style.textDecoration="none"; 
        li.appendChild(a); 
        $('#show-list').append(li);
        $('#show-list').append('<br>'); 
    });
}

function show12(){
    
    var html='';
    var ii=0;
    jQuery('#show-list').html('');
    $('#show-list').append('<br>'); 
    var k1=Object.keys(link1);
    var i=0;
    k1.forEach(function(r){
        console.log(r);
        // html+='<a href="/uploads/"'+r+'">'+r+'</a><br>';
        var p1='/uploads/'+r;
        var li=document.createElement('li');

        var a=document.createElement('a');
        var s=r;
        var d=s.split("$");
        var r1=d[2];
        
        for(i=0;i<r1.length;i++)
        {
            r1=r1.replace("_"," ");
        }
        var link = document.createTextNode(r1); 
        a.appendChild(link);  


        a.title = r;   
        a.href = p1;
ii=ii+1;

        if(ii%5==0)
        {
        a.style.color="blue";
        }
        if(ii%5==1)
        {
        a.style.color="green";
        }if(ii%5==2)
        {
        a.style.color="red";
        }if(ii%5==3)
        {
        a.style.color="teal";
        }if(ii%5==4)
        {
        a.style.color="orange";
        }
        a.style.textDecoration="none";
        // li.style.backgroundColor="lightgreen";
        // li.style.borderRadius="4px";

        
        li.appendChild(a); 
        
        $('#show-list').append(li);
        $('#show-list').append('<br>'); 
    });
    
    // html+='<a href=/uploads/"'+file+'">'+file+'</a>';
    //$('#show-list').append(html);
}

function updateViewLogsButton() {
    return;

    var req = new XMLHttpRequest();
    req.open('GET', 'logs.json');
    req.onload = function() {
        var json = JSON.parse(req.responseText);
        var length = Object.keys(json).length;
        if (length) {
            $('#view-logs').html('Error Logs (' + length + ')');
        } else {
            $('#view-logs').html('Error Logs');
        }
    };
    req.send();
}
// updateViewLogsButton();

$('#view-logs').click(function() {
    return alertBox('This feature is temporarily disabled.');

    $('#view-logs').html('Loading...');
    $('#logs-viewer').html('Loading...');

    var req = new XMLHttpRequest();
    req.open('GET', 'logs.json');
    req.onload = function() {
        var json = JSON.parse(req.responseText);
        $('#view-logs').html('Error Logs');
        updateViewLogsButton();

        var table = document.createElement('table');
        table.className = 'table';
        var html = '';
        html += '<thead>';
        html += '<th>Event/Method</th>';
        html += '<th>Error Message</th>';
        html += '<th>Error Stack</th>';
        html += '<th>Date/Time</th>';
        html += '</thead>';
        html += '<tbody>';

        var keys = Object.keys(json);
        keys.forEach(function(key) {
            var item = json[key];

            html += '<tr>';
            html += '<td>' + item.name + '</td>';
            html += '<td>' + item.message + '</td>';
            html += '<td><pre>' + item.stack + '</pre></td>';
            html += '<td>' + item.date + '</td>';
            html += '</tr>';
        });

        if (!keys.length) {
            html += '<tr><td>Error logs file is empty.</td></tr>';
        }
        html += '</tbody>';
        $(table).html(html);

        if (keys.length) {
            $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;"><button id="clear-logs" class="btn btn-primary" style="padding: 4px 8px;font-size: 13px;line-height: 1;">Clear Error Logs</button> (permanently delete from logs.json)</div>');
            $('#logs-viewer').append(table);
        } else {
            $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;">Error logs file is empty.</div>');
        }

        if (keys.length) {
            $('#clear-logs').click(function() {
                $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;">Deleting...</div>');
                socket.emit('admin', {
                    clearLogs: true
                }, function(isCleared) {
                    if (isCleared) {
                        $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;">Error logs are cleared from logs.json.</div>');
                        updateViewLogsButton();
                    } else {
                        $('#logs-viewer').html(isCleared);
                    }
                });
            });
        }
    };
    req.send();
});

function getUserInfo(userid, callback) {
    socket.emit('admin', {
        userid: userid,
        userinfo: true
    }, function(userinfo) {
        if (userinfo.error) {
            var div = document.createElement('div');
            $(div).css({
                textAlign: 'center',
                marginBottom: 10
            });
            $(div).html(userinfo.error);
            callback(div);
            return;
        }

        var table = document.createElement('table');
        table.className = 'table';
        var html = '';
        html += '<tr><td>userid</td><td>' + userid + '</td></td></tr>';
        ['sessionid', 'session', 'extra', 'mediaConstraints', 'sdpConstraints', 'streams'].forEach(function(item) {
            html += '<tr>';
            html += '<td>' + (item === 'sessionid' ? 'roomid' : item) + '</td>';
            if (typeof userinfo[item] === 'string') {
                html += '<td>' + userinfo[item] + '</td>';
            } else {
                if (item === 'streams' && userinfo[item]) {
                    html += '<td>';
                    html += '<table>';
                    html += '<thead>';
                    html += '<th>streamid</th>';
                    html += '<th>tracks</th>';
                    html += '</thead>';
                    html += '<tbody>';

                    userinfo[item].forEach(function(stream) {
                        html += '<tr>';
                        html += '<td>' + stream.streamid + '</td>';
                        html += '<td>' + stream.tracks + '</td>';
                        html += '</tr>';
                    });
                    html += '</tbody>';
                    html += '</table>';
                    html += '</td>';
                } else {
                    html += '<td>' + JSON.stringify(userinfo[item] || '') + '</td>';
                }
            }
            html += '</tr>';
        });
        $(table).html(html);
        $(table).find('.delete-user').click(function() {
            var that = this;

            var userid = $(this).attr('data-userid');
            confirmBox('User "<b>' + userid + '</b>" will be deleted from server.', function(isConfirmed) {
                if (!isConfirmed) return;

                $(that).prop('disabled', true).html('Deleting...');

                socket.emit('admin', {
                    deleteUser: true,
                    userid: userid
                }, function(isDeleted) {
                    if (isDeleted) {
                        $('.bd-example-modal-lg').modal('hide');

                        socket.emit('admin', {
                            all: true
                        });
                    } else {
                        alertBox('Unable to delete this user.', 'Can Not Delete');
                    }
                });
            });
        });
        callback(table);
    });
}

function alertBox(message, title, specialMessage, callback) {
    callback = callback || function() {};

    $('.btn-alert-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#alert-box').modal('hide');
        $('#confirm-box-topper').hide();

        callback();
    });

    $('#alert-title').html(title || 'Alert');
    $('#alert-special').html(specialMessage || '');
    $('#alert-message').html(message);
    $('#confirm-box-topper').show();

    $('#alert-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

function confirmBox(message, callback) {
    $('#btn-confirm-action').html('Confirm').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(true);
    });

    $('#btn-confirm-close').html('Cancel');

    $('.btn-confirm-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(false);
    });

    $('#confirm-message').html(message);
    $('#confirm-title').html('Please Confirm');
    $('#confirm-box-topper').show();

    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

$('#view-userinfo').click(function() {
    var userid = $('#txt-userid').val();
    if (!userid || !userid.replace(/ /g, '').length) return;

    $('#view-userinfo').prop('disabled', true);
    $('#logs-viewer').html('Loading...');
    getUserInfo(userid, function(table) {
        $('#logs-viewer').html('').append(table);
        $('#view-userinfo').prop('disabled', false);
    });

    $('#exampleModal').modal('hide');
    $('.bd-example-modal-lg').modal('show');
});
