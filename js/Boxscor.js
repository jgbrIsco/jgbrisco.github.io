$(document).ready(function() {
    console.log("document ready");
    $("#datepicker").datepicker({
        onSelect: function (dateText) {
        }
    }).on("change", function (dateText) {
        console.log("Got change event from field");
        console.log("dateText.target.value is " + dateText.target.value);
        console.log("this.value is: " + this.value);
        console.log(this.value.substr(6, 4) + this.value.substr(0, 2) + this.value.substr(3, 2));
        var formattedDateParam = this.value.substr(6, 4) + this.value.substr(0, 2) + this.value.substr(3, 2);
        loadXMLDoc(formattedDateParam)
    });
});
function loadXMLDoc(scheduledDate) {
    console.log("Value of passed param scheduledDate is: " + scheduledDate);
    var ScheduledDate = scheduledDate;
    if(ScheduledDate === "today"){
        ScheduledDate = convertTodayDate(ScheduledDate);
    }
    var SingleMLB = 'https://fk65r2j0j2.execute-api.us-west-2.amazonaws.com/dev/boxscor/single?ScheduleDate='
        + ScheduledDate;
    console.log("URL is : " + SingleMLB);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            console.log(xhttp.responseText);
            let parsedJSON;
            try {
                parsedJSON = JSON.parse(xhttp.responseText);
            }
            catch(exception){
                $("#scoresTable tr").remove();
                var tableRef = document.getElementById('scoresTable').getElementsByTagName('tbody')[0];
                var newRow   = tableRef.insertRow(tableRef.rows.length);
                var newCell  = newRow.insertCell(0);
                var newText  = document.createTextNode("Do not have scores for " + ScheduledDate);
                newCell.appendChild(newText);
                parsedJSON = "error: received bad or unexpected data";
                console.log(exception);
            }

            console.log(parsedJSON);
            console.log("ScheduleDate = " + parsedJSON[0].MLBSeasonDateJSON.ScheduleDate);
            let ScheduleDate = parsedJSON[0].MLBSeasonDateJSON.ScheduleDate;
            if(isDateString(parsedJSON[0].MLBSeasonDateJSON.ScheduleDate))
            {
                console.log("ScheduleDate returned  " + parsedJSON[0].MLBSeasonDateJSON.ScheduleDate);
                var thisScheduleDate = new Date(parsedJSON[0].MLBSeasonDateJSON.ScheduleDate);
                var myformattedUTCDate = new Date(parsedJSON.lastRefreshTime);
            }
            else {
                console.log("ScheduleDate returned something unexpected");
            }
            if (parsedJSON[0].MLBSeasonDateJSON.Games.length === 0) {
                console.log("parsedJSON[0].MLBSeasonDateJSON.Games.length === 0 ... No Games Scheduled");
          //      $("show-data").remove();
                display("ScheduleDate = " + parsedJSON[0].MLBSeasonDateJSON.ScheduleDate + "  No Games Scheduled");
            }
            if (parsedJSON[0].MLBSeasonDateJSON.Games.length > 0) {
                var tableRef = document.getElementById('scoresTable').getElementsByTagName('tbody')[0];
                var newRow   = tableRef.insertRow(tableRef.rows.length);
                var newCell  = newRow.insertCell(0);
                var newText  = document.createTextNode("MLB Scores for " + thisScheduleDate.toLocaleDateString());
                newCell.appendChild(newText);
                $("#scoresTable tr").remove();

                loadScoresTable(parsedJSON)
               let timestampElement = document.createElement('div');
               console.log("lastRefreshTime:  " + parsedJSON[0].lastRefreshTime.toString());
               document.getElementById("show-data").appendChild(timestampElement);
            }
        }
    };
    xhttp.open("GET", SingleMLB, true);
    xhttp.send();
}
function loadScoresTable(myParsedJSON){
    var thisScheduleDate = new Date(myParsedJSON[0].MLBSeasonDateJSON.ScheduleDate);
    var thisScheduleDateString = "MLB Scores for " + thisScheduleDate.toLocaleDateString();
    document.getElementById('scoreDate').textContent = thisScheduleDateString;

    var thisUpdateTime = new Date(myParsedJSON[0].lastRefreshTime.toString());
    var thisUpdateTimeString = "Last updated on " + convertUpdateTimestamp(thisUpdateTime);

    document.getElementById('updateDate').textContent = thisUpdateTimeString;

    var tableRef = document.getElementById('scoresTable').getElementsByTagName('tbody')[0];
    for(let i = 0; i < myParsedJSON[0].MLBSeasonDateJSON.Games.length; i++){
        var tableRef = document.getElementById('scoresTable').getElementsByTagName('tbody')[0];
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newCell  = newRow.insertCell(0);
        var newText  = document.createTextNode(myParsedJSON[0].MLBSeasonDateJSON.Games[i].HomeTeam);
        newCell.appendChild(newText);
        var newCell  = newRow.insertCell(1);
        var newText  = document.createTextNode(myParsedJSON[0].MLBSeasonDateJSON.Games[i].HomeScore);
        newCell.appendChild(newText);
        var newCell  = newRow.insertCell(2);
        var newText  = document.createTextNode(myParsedJSON[0].MLBSeasonDateJSON.Games[i].VisitingTeam);
        newCell.appendChild(newText);
        var newCell  = newRow.insertCell(3);
        var newText  = document.createTextNode(myParsedJSON[0].MLBSeasonDateJSON.Games[i].VisitingScore);
        newCell.appendChild(newText);
        var newCell  = newRow.insertCell(4);
        var newText  = document.createTextNode(myParsedJSON[0].MLBSeasonDateJSON.Games[i].GameStatus);
        newCell.appendChild(newText);
    }
}
function isDateString(str){
    return !isNaN(Date.parse((str)));
}
let dateReviver = function(key, value){
    if(typeof value === "string"){
        if(isDateString(value)){
            return new Date(value)
        }
    }
    return value;
}
function convert2Date(){
    let dateReviver = function(key, value){
        if(typeof value === "string"){
            if(isDateString(value)){
                return new Date(value)
            }
        }
        return value;
    }
}
function convertTodayDate(todayDate) {
    // if date is string 'today' convert it to a formatted parameter string
    var d = new Date();
    // need to fix this for 0 and non 0 months & days
    var month = (d.getMonth()+1).toString();
    var day = d.getDate().toString();
    if (month.length === 1) {
        month = "0" + month;
    }
    if (day.length === 1) {
        day = "0" + day;
    }
    var testdateString = d.getFullYear().toString() + month + day;
    console.log("converted 'today' date is " + testdateString);
    return testdateString;
}
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
function convertUpdateTimestamp(updateZuluDate)
{
//  var nonZeroBasedMonth = 
  var formattedTimestampString =
      (updateZuluDate.getMonth() + 1) + "-" +
      updateZuluDate.getDate() + "-" +
      updateZuluDate.getFullYear() + " at ";
      var h = addZero(updateZuluDate.getHours());
      var m = addZero(updateZuluDate.getMinutes());
      var s = addZero(updateZuluDate.getSeconds());
  var formattedTimestampString = formattedTimestampString +
      h.toString() + ":" + m.toString() + ":" + s.toString();
  console.log("convertUpdateTimestamp for input " + updateZuluDate + " returns " + formattedTimestampString);
  return formattedTimestampString;
}
function display(msg) {
    $("<p>").html(msg).appendTo(document.body);
}
function leagueNotYetImplemented(){
  console.log("leagueNotYetImplemented is called");
  $("#scoreDate").text('This league is not yet implemented');
  $("#scoresBody tr").remove();
  $("#updateDate").empty();
}
