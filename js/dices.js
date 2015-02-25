
var players = []
var rounds = 0;
var enable_debug = true;
var maxRounds = 10;

function loadXMLDoc(url, callback)
{
    var xmlhttp;
    if (window.XMLHttpRequest)
    {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    }
    else
    {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function Player(name)
{
    this.name = name;
    this.points = 0;
    this.throwDices = function ()
    {
        debug("Throwing dice for: " + this.name)
        d1 = randomIntFromInterval(1, 6);
        d2 = randomIntFromInterval(1, 6);
        document.getElementById("player_img_" + this.name + "_dice_1").src = getDiceImg(d1);
        document.getElementById("player_img_" + this.name + "_dice_1").alt = d1;
        document.getElementById("player_img_" + this.name + "_dice_2").src = getDiceImg(d2);
        document.getElementById("player_img_" + this.name + "_dice_2").alt = d2;
        var res;
        if (d1 != d2)
        {
            document.getElementById("player_result_" + this.name).innerHTML= "Failed"
            document.getElementById("player_row_" + this.name).setAttribute("class", "danger");
            /*debug("{} lost.".format(this.name))*/
            res = false;
        }
        else
        {
            ++this.points;
            document.getElementById("player_result_" + this.name).innerHTML= "Success";
            document.getElementById("player_row_" + this.name).setAttribute("class", "success");
            debug(this.name + " won !")
            res = true;
        }
        document.getElementById("player_points_" + this.name).innerHTML = printPoints(this.points);
        return res;
    };
}

function addPlayer(name)
{
    debug("Adding new player: " + name);
    players.push(new Player(name));
    var s = "";
    s += "<tr id='player_row_" + name + "'>";
    s += "  <td class='col-md-2' id='player_name_" + name + "'>" + name + "</td>";
    s += "  <td class='col-md-2' id='player_points_" + name + "'></div>";
    s += "  <td class='col-md-2' id='player_result_" + name + "'></div>";
    s += "  <td class='col-md-4' id='player_img_" + name + "'>";
    s += "    <img id='player_img_" + name + "_dice_1' src='" + getDiceImg(1) + "' class='img-thumbnail' alt='dice'/>"
    s += "    <img id='player_img_" + name + "_dice_2' src='" + getDiceImg(1) + "' class='img-thumbnail' alt='dice'/>"
    s += "</div>";
    s += "</tr>";
    document.getElementById("players-table-body").innerHTML += s;
}

function resetValues()
{
    document.getElementById("players-table-body").innerHTML = "";
    players = [];
}

function playersLoaded(data)
{
    debug("Loaded: " + data)
    jdata = JSON.parse(data);
    for (idx in jdata)
    {
        addPlayer(jdata[idx]);
    }
}

function loadPlayers()
{
    var json_url = "/resources/players.json";
    resetValues();
    debug("Loading from JSON: " + json_url);
    loadXMLDoc(json_url, playersLoaded)
}

function addPlayers()
{
    resetValues();
    debug("Adding hardcoded values");
    addPlayer("Francois");
    addPlayer("Nicolas");
    addPlayer("Jacques");
    addPlayer("Georges");
    addPlayer("Charles");
}

function randomIntFromInterval(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function printPoints(points)
{
    if (points > 1)
    {
        return points + " points";
    }
    else
    {
        return points + " point";
    }
}

function getDiceImg(number)
{
    return "img/dice-" + number + ".jpg";
}


function debug(text)
{
    if (!enable_debug)
        return;
    d = document.getElementById("debug");
    d.innerHTML += text + "<br/>"

    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight,
                           html.clientHeight, html.scrollHeight, html.offsetHeight );

    d.style.backgroundColor= "lightblue";
    d.style.maxHeight = height - 100 + "px";
    d.scrollTop = d.scrollHeight;
}

function debugHr()
{
    if (!enable_debug)
        return;
    document.getElementById("debug").innerHTML += "<hr/>"
    document.getElementById("debug").style.backgroundColor= "lightblue";
}

function showModal(title, text)
{
    document.getElementById("result_modal_content").innerHTML = "<p>" + text + "</p>";
    document.getElementById("mySmallModalLabel").innerHTML = "<p>" + title + "</p>";
    $('#result_modal').modal({
      keyboard: false
    })
}

function updateProgressBar(cur, max)
{
    var perc = (cur * 100 / max);
    $('.progress-bar').css('width', perc + '%').attr('aria-valuenow', perc);
    $('.progress-bar').text(perc + '%');
    $('.progress-bar').css('width', perc + '%').attr('aria-valuenow', perc);
}

function throwDicesForAllPlayers()
{
    if (players.length == 0)
    {
        showModal("Oops", "No player defined!");
        return;
    }
    debugHr();
    ++rounds;
    if (rounds == maxRounds)
    {
        debug(maxRounds + " rounds executed. Game is over");
        updateProgressBar(maxRounds, maxRounds);
        $('.progress-bar').removeClass("progress-bar-striped active");
        var winner = "the winner";
        var max_points = 0;

        for (idx in players)
        {
            if (players[idx].points > max_points)
            {
                winner = players[idx].name;
                max_points = players[idx].points;
            }
        }
        showModal("Game over", maxRounds + " rounds executed. Winner is: " + winner + " with " + printPoints(max_points) + ".");
        return;
    }
    else if (rounds > maxRounds)
    {
        debug(maxRounds + " rounds executed. You cannot continue ! Please start again !!!");
        showModal("Oops", maxRounds + " rounds executed. You cannot continue ! Please start again !!!")
        return;
    }
    debug("<b>New round start: " + rounds + "/" + maxRounds + "</b>");
    debug(">" + $('.progress-bar'));
    updateProgressBar(rounds, maxRounds);
    var found = false;
    var won = [];
    for (idx in players) {
        if (players[idx].throwDices())
        {
            found = true;
        }
        else
        {
            won.push(players[idx].name);
        }
    }
    if (!found)
    {
        debug("No winner this round.");
    }
    debug("Round finished")
}
