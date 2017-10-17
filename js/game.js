var player;
var player_provinces = 0;
var player_score = 0;

// INITIALIZE THE GAME CANVAS
// initialize the canvas
$(function() {
    // select party
    player = parties.filter(function(party) {
        return party.name == "red";
    })[0];
    // remove party from competitors
    parties = parties.filter(function(party) {
        return party.name != player.name;
    });

    // // debug
    // console.log("Player: " + player.name);
    // console.log("Other Players: " + parties[0].name + " and " + parties[1].name);

    // set colors for each cell
    $("td.province").each(function() {
        //
        var colors = ["rgb(244, 67, 54)", "rgb(255, 152, 0)", "rgb(33, 150, 243)"];

        // assign random colors
        var cell_color = colors[Math.floor(Math.random() * colors.length)];
        $(this).css("background-color", cell_color);

        // set score for each cell
        $(this).data("score", 1);
        // show score for each cell
        $(this).text($(this).data("score"));

    });

    $("td").each(function() {
        // if the color is the player's color - add player class
        if ($(this).css("background-color") == player.color) {
            $(this).addClass("player");

        } else { // make other team not clickable
            $(this).addClass("unclickable")
        };
    });

    $("td.province").click(function() {
        clickHandler($(this));
    });
});

// this adds score every 1 second
var interval = window.setInterval(addScore, 1000);

function addScore() {
    $("td.province").each(function() {

        current_score = $(this).data("score");

        // rate of new score added
        if ($(this).hasClass("main_capital")) {
            new_score = current_score + 1;
        } else if ($(this).hasClass("capital")) {
            new_score = current_score + 1;
        } else if (Math.random() >= 0.5) {
            new_score = current_score + 1;
        } else {
            new_score = current_score + 0;
        }

        if ($(this).hasClass("main_capital")) {
            new_score = (new_score >= 15 ? 15 : new_score);
        } else if ($(this).hasClass("capital")) {
            new_score = (new_score >= 10 ? 10 : new_score);
        } else {
            new_score = (new_score >= 5 ? 5 : new_score);
        }
        $(this).data("score", new_score);
        $(this).text(new_score);
    });
}

function clickHandler(tile) {
    countProvinces();
    // get neighbouring cells
    var index = tile.index();
    var left = tile.prev("td");
    var right = tile.next("td");
    var top = tile.closest("tr").prev("tr").find("td:eq(" + index + ")");
    var bottom = tile.closest("tr").next("tr").find("td:eq(" + index + ")");

    // blur all provinces
    // make em unclickable
    $("td").each(function() {
        $(this).css("filter", "blur(5px)");
        $(this).addClass("unclickable");
    });

    // unblur neighbouring provinces
    left.css("filter", "blur(0px)");
    right.css("filter", "blur(0px)");
    top.css("filter", "blur(0px)");
    bottom.css("filter", "blur(0px)");
    tile.css("filter", "blur(0px)");
    // make em clickable
    left.removeClass("unclickable");
    right.removeClass("unclickable");
    top.removeClass("unclickable");
    bottom.removeClass("unclickable");
    tile.removeClass("unclickable");

    // listeners for neighbouring tiles

    tile.click(function() {
        resetHandlers();
    });

    left.click(function() {
        console.log($(this).closest("tr").index(), $(this).index());
        attackRegion(tile, $(this));
        resetHandlers();
    });

    right.click(function() {
        console.log($(this).closest("tr").index(), $(this).index());
        attackRegion(tile, $(this));
        resetHandlers();
    });

    top.click(function() {
        console.log($(this).closest("tr").index(), $(this).index());
        attackRegion(tile, $(this));
        resetHandlers();
    });

    bottom.click(function() {
        console.log($(this).closest("tr").index(), $(this).index());
        attackRegion(tile, $(this));
        resetHandlers();
    });
}

function attackRegion(attacker_region, defender_region) {

    var attack_score = attacker_region.data("score");
    var defender_score = defender_region.data("score");

    // if same player province
    if (attacker_region.hasClass("player") && defender_region.hasClass("player")) {
        console.log("Troops transfer");
        defender_score = defender_score + attack_score;
        attack_score = 1;
        console.log("ATK: " + attack_score + ", DEF:" + defender_score);
        updateRegion(attacker_region, defender_region, attack_score, defender_score);


    } else {

        while (attack_score > 0) {

            var attack_roll = Math.floor(Math.random() * 6) + 1;
            var defense_roll = Math.floor(Math.random() * 6) + 1;

            if (attack_roll > defense_roll) {
                defender_score--;
            } else if (attack_roll < defense_roll) {
                attack_score--;
            } else {
                attack_score--;
                defender_score--;
            }

            if (defender_score <= 0) {
                break
            }
        }

        console.log("ATK: " + attack_score + ", DEF:" + defender_score);
        updateRegion(attacker_region, defender_region, attack_score, defender_score);
    }
}

function updateRegion(attacker_region, defender_region, attack_score, defender_score) {

    if (attacker_region.hasClass("player") && defender_region.hasClass("player")) {
        console.log("Troops transfer between own provinces...");
        attacker_region.data("score", 1);
        defender_region.data("score", defender_score);
    } else if (attack_score <= 0) { // defender won
        // update scores, no changes
        console.log("Defender won! Updating scores...")
        attacker_region.data("score", 1);
        defender_region.data("score", defender_score);
    } else if (defender_score <= 0) { // attacker won
        // change defender region
        console.log("Attacker won! Reassigning province and updating scores...")
        defender_region.css("background-color", player.color);
        defender_region.removeClass("unclickable");
        defender_region.addClass("player");
        // update score - move troops to new region
        attacker_region.data("score", 1);
        defender_region.data("score", attack_score);

    } else {
        console.log("Something went wrong...")
    }
    // update each tile with new score
    $("td").each(function() {
        $(this).text($(this).data("score"));

    });
    console.log("Regions updated.")
    countProvinces();
    countScore();

    console.log("Player score: " + player_score);
    console.log("Player province count: " + player_provinces);
}

function countProvinces() {
    player_provinces = 0;

    $("td").each(function() {
        if ($(this).hasClass("player")) {
            player_provinces += 1;
        }
    });
}

function countScore() {
    player_score = 0;

    $("td").each(function() {
        if ($(this).hasClass("player") && $(this).hasClass("main_capital")) {
            player_score += 100
        } else if ($(this).hasClass("player") && $(this).hasClass("capital")) {
            player_score += 50
        } else if ($(this).hasClass("player") && $(this).hasClass("capital")) {
            player_score += 10
        } else if ($(this).hasClass("player") && $(this).hasClass("capital")) {
            player_score += 0
        }
    });
}

function resetHandlers() {
    // unblur non neighbouring provinces
    $("td.province").each(function() {
        $(this).css("filter", "blur(0px)");
    });

    // remove the click listener
    $("td.province").unbind("click");

    // add new listener to all provinces
    $("td.province").click(function() {
        clickHandler($(this));
    });

    // update class for each province
    $("td").each(function() {
        if ($(this).css("background-color") == player.color) {
            $(this).removeClass("unclickable")
            $(this).addClass("player");
            // make other team not clickable
        } else {
            $(this).removeClass("player")
            $(this).addClass("unclickable")
        };
    });
}

function gameLog(data) {
    $("#gamelog").append(`<li class="list-group-item">` + data + `</li>`);
}
