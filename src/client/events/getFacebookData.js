// Define port.
var port = chrome.runtime.connect({name: 'facebookData'});

// Get FB IDs.
var fbID = $.cookie('c_user');
var fb_dtsg = $('input[name="fb_dtsg"]').val();

var getThreadList = function (limit) {
  port.postMessage(Date());
  // Construct request body.
  requestBody = {
    '__a': 1,
    'fb_dtsg': fb_dtsg,
    'inbox[offset]': 0,
    'inbox[limit]': typeof limit !== 'undefined' ? limit : 1000
  };
  // Send POST request.
  $.ajax({
    type: 'POST',
    url: '/ajax/mercury/threadlist_info.php',
    data: requestBody,
    dataType: 'text',
    success: function (response) {
      json = JSON.parse(response.replace(/[for (;;);]+/, ''));
      port.postMessage(json['payload']);
      // Parse threads.
      parseThreads(json['payload']['threads']);
      // Parse participants.
      parseParticipants(json['payload']['participants']);
    },
  });
};

var parseThreads = function (threads) {
  // Create response object.
  response = {};
  response.type = 'ThreadInfo';
  response.fbID = fbID;
  response.threads = [];
  // Add reduced info for each thread (id, date, active/former particpants).
  threads.forEach(function (threadFull) {
    thread = {};
    thread.id = threadFull.thread_id;
    thread.timestamp = threadFull.timestamp;
    thread.activeParticipants = threadFull.participants.join(',');
    thread.formerParticipants = [];
    thread.messageCount = threadFull.message_count;
    threadFull.former_participants.forEach(function (participant) {
      thread.formerParticipants.push(participant.id);
    });
    thread.formerParticipants = thread.formerParticipants.join(',');
    response.threads.push(thread);
  });
  // Return response.
  port.postMessage(response);
};

var parseParticipants = function (participants) {
  // Create response object.
  response = {};
  response.type = 'ThreadParticipants';
  response.fbID = fbID;
  response.participants = [];
  // Add reduced info for each participant (id, name, vanity, friendship).
  participants.forEach(function (participantFull) {
    participant = {};
    participant.id = participantFull.id;
    participant.name = participantFull.name;
    participant.gender = participantFull.gender;
    participant.isFriend = participantFull.is_friend ? 1 : 0;
    participant.vanity = participantFull.vanity;
    response.participants.push(participant);
  });
  // Return response.
  port.postMessage(response);
};

var getThreadContents = function (threadID, limit) {
  // Construct request body.
  requestBody = {
    '__a': 1,
    'fb_dtsg': fb_dtsg
  };
  requestBody['messages[thread_ids][' + threadID + '][offset]'] = 0;
  requestBody['messages[thread_ids][' + threadID + '][limit]'] =
      typeof limit !== 'undefined' ? limit : 1000;
  // Send POST request.
  $.ajax({
    type: 'POST',
    url: '/ajax/mercury/thread_info.php',
    data: requestBody,
    dataType: 'text',
    success: function (response) {
      json = JSON.parse(response.replace(/[for (;;);]+/, ''));
      response = {};
      response.type = 'ThreadContents';
      response.fbID = fbID;
      response.threadID = threadID;
      response.messages = [];
      json['payload']['actions'].forEach(function (action) {
        message = {};
        message.timestamp = action.timestamp;
        message.id = action.message_id;
        message.author = action.author;
        message.body = action.body;
        response.messages.push(message);
      });
      port.postMessage(response);
      // threadIDs = json['payload']['ordered_threadlists'][0]['thread_ids'];
      // port.postMessage(threadIDs);
    },
  });
};

getThreadList();
getThreadContents("id.384338381590512", 2804);