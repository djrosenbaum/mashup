//Memory Object
var memory = {

    cards : {
        card_array : [],
        match_sets : 5,
        total_cards : null,
        shuffle_cards : null
    },

    firebase : {
        broadcast_update : null,
        display_players : null,
        display_room : null,
        join_game : null,
        matchmaker : new Firebase('https://matchmaker.firebaseio.com/'),
        player_id : '',
        players : null,
        remove_user_from_list : null,
        score : null,
        send_update : null
    },

    game_board : {
        determine_row_size : null,
        game_won : null,
        init_game_board : null,
        layout_cards : null,
        reset : null,
        row_size : null,
    },

    game_play : {
        add_listeners : null,
        click_state : false,
        click_timer : null,
        current_number : null,
        current_location : null,
        game_paused : false,
        reset_tiles : null
    },

    reddit : {
        fetch_cards_from_reddit : null,
        json_images_url : 'http://www.reddit.com/r/TheSimpsons/hot.json?limit=100',
        json_data : null,
        image_url : null,
        small_image_url : null,
        imgur_array : []
    },

    stats : {
        best_score : 0,
        total_moves : 0,
        games_played : 0
    }

};

memory.game_board.init_game_board = function() {

    //TOTAL NUMBER OF SQUARES IN THE GRID
    memory.cards.total_cards = memory.cards.match_sets * 2;

    //DETERMINE THE NUMBER OF TILES IN A ROW
    memory.game_board.row_size = memory.game_board.determine_row_size();

    //PUSH 2 SETS OF NUMBERS INTO ARRAY FOR EACH MATCH_SET
    for ( var i = 0; i < memory.cards.match_sets; i++ ) {
        memory.cards.card_array.push(i);
        memory.cards.card_array.push(i);
    }

    //FETCH CARDS FROM REDDIT
    memory.reddit.fetch_cards_from_reddit();

};

memory.game_board.determine_row_size = function() {
    //GET SQUARE ROOT OF TOTAL CARDS
    var square_root = Math.sqrt( memory.cards.total_cards );

    //IF SQUARE ROOT IS 8 OR LESS AND AN INTEGER CREATE A SQUARE LAYOUT
    if ( square_root <= 8 && square_root % 1 === 0 ) {
        return square_root;
    }

    //ELSE CREATE A RECTANGLE LAYOUT WITH A MAXIMUM OF 8 TILES TO A ROW
    else {
        for (var i=8; i>=2; i--) {
            if ( memory.cards.total_cards % i === 0) {
                return i;
            }
        }
    }
};

//Shuffle the cards
//1. determine number of cards to shuffle
//2. select a random card from the array
//3. swap the random card with the last unshuffled card
memory.cards.shuffle_cards = function() {

    //TOTAL NUMBERS LEFT IN ARRAY
    var cards_left_to_shuffle = memory.cards.card_array.length;

    //LAST NUMBER IN ARRAY NOT YET SHUFFLED
    var last_number_in_array;

    //RANDOMLY SELECTED INDEX BASED ON CARDS LEFT TO SHUFFLE
    var random_index;

    // WHILE CARDS REMAINING TO SHUFFLE
    while ( cards_left_to_shuffle > 0 ) {

        //PICK A RANDOM INDEX BASED ON THE CARDS LEFT TO SHUFFLE
        random_index = Math.floor(Math.random() * cards_left_to_shuffle);

        //TOTAL NUMBERS IN ARRAY MINUS 1 TO MATCH 0 BASED INDEX
        cards_left_to_shuffle -= 1;

        //LAST NUMBER IN THE ARRAY TO SHUFFLE
        last_number_in_array = memory.cards.card_array[cards_left_to_shuffle];

        // ==== SWAP THE CARDS ====
        //LAST NUMBER IN ARRAY IS EQUAL TO RANDOM INDEX
        memory.cards.card_array[cards_left_to_shuffle] = memory.cards.card_array[random_index];

        //RANDOM INDEX IS EQUAL TO LAST NUMBER IN THE ARRAY
        memory.cards.card_array[random_index] = last_number_in_array;
    }

};


//GENERATE GAME BOARD
memory.game_board.layout_cards = function() {

    //WHICH COLUMN THE CARD IS PLACED
    var j = 1;

    //LOOP THROUGH ALL OF THE CARDS
    for ( var i = 0; i < memory.cards.total_cards; i++ ) {

        var imgur_array_index = memory.cards.card_array[i];
        //console.log('imgur array index', imgur_array_index);

        var imgur_url = memory.reddit.imgur_array[imgur_array_index];
        //console.log('imgur url: ', imgur_url);

        var memory_button_html = '<div class="memory_button' + check_tile_column(j)  + '" data-location="' + i + '" data-number="' + memory.cards.card_array[i] + '"><img class="hidden" src="' + memory.reddit.imgur_array[memory.cards.card_array[i]] + '" width="125" height="125"></div>';

        //IF THE TILE IS IN THE LAST GRID COLUMN, RESET BACK TO THE FIRST COLUMN
        if ( j === 1 || j < memory.game_board.row_size ) {
            j++;
        }
        else {
            j = 1;
        }

        //DEAL CARD TO THE GAME BOARD
        memory.game_board.deal_card( memory_button_html );
    }

};

memory.game_board.check_tile_column = function(j) {
    console.log('checking tile column');
    if ( j === 1 ) {
        return ' left_square';
    }
    else {
        return '';
    }
};

memory.game_board.deal_card = function ( memory_button_html ) {
    $('.game_board').append(memory_button_html);
};

memory.game_board.game_won = function() {

    memory.stats.games_played += 1;

    var highlight_timer = 100;

    $('.game_board .memory_button').each(function(){

        var that = $(this);

        highlight_timer += 100;

        setTimeout( function(){

            that.addClass('highlight');

        }, highlight_timer);

    });

    memory.stats.check_best_score();

    memory.firebase.send_update();
};

memory.stats.check_best_score = function() {

    if ( memory.stats.best_score === 0 ) {
        memory.stats.best_score = memory.stats.total_moves;
    }
    else if ( memory.stats.total_moves < memory.stats.best_score ) {
        memory.stats.best_score = memory.stats.total_moves;
    }

};

memory.game_play.add_listeners = function() {

    memory.game_play.click_state = false;
    memory.game_play.current_number = null;
    memory.game_play.current_location = null;

    memory.game_play.memory_button_listener();

};

memory.game_play.memory_button_listener = function() {

    $('.memory_button').on('click', function() {

        clearTimeout(memory.game_play.click_timer);

        if ( memory.game_play.click_state === false ) {
            memory.game_play.reset_tiles();
        }

        //CHECK IF THE BOARD IS CLICKABLE
        if ( memory.game_play.game_paused === true ) {
            return;
        }

        //CHECK IF THE TILE HAS ALREADY BEEN MATCHED
        if ( $(this).hasClass('match') ) {
            return;
        }

        //SET THE MEMORY BUTTON THAT WAS CLICKED TO ACTIVE
        $(this).addClass('active');

        memory.game_play.check_click_order();

    });

};

memory.game_play.check_click_order = function() {
    //Step 1. CHECK IF FIRST CLICK OR SECOND CLICK
    if ( memory.game_play.click_state === false ) {
        memory.game_play.first_click( $(this) );
    }
    else {
        memory.game_play.second_click( $(this) );
    }
};

memory.game_play.first_click = function( $this ) {
    //FIRST CLICK

    //store the selected button number
    selected_number = $this.attr('data-number');

    //set the current number
    memory.game_play.current_number = selected_number;

    //set the current location
    memory.game_play.current_location = $(this).attr('data-location');

    //show the image
    $this.children('img').removeClass('hidden');

    //set click state to true for second click
    memory.game_play.click_state = true;
};

memory.game_play.second_click = function( $this ) {
    //SECOND CLICK

    //selected data location
    var selected_location = $this.attr('data-location');

    //IF THE USER CLICKED THE SAME TILE
    if ( selected_location === memory.game_play.current_location ) {
        return;
    }

    //RESET THE CLICK STATE
    memory.game_play.click_state = false;

    //STORE THE SELECTED NUMBER
    selected_number = $this.attr('data-number');

    //SHOW THE IMAGE
    $this.children('img').removeClass('hidden');

    //CHECK FOR MATCH
    memory.game_play.check_for_match( selected_number );

    //INCREMENT SCORE
    memory.game_play.increment_score();

    //SHOW THE SCORE IN THE DOM
    memory.game_play.show_updated_score();
};

memory.game_play.check_for_match = function( selected_number ) {
    if ( selected_number === memory.game_play.current_number ) {
        //THERE IS A MATCH
        memory.game_play.matched_a_tile();
    }
    else {
        //THERE IS NOT A MATCH
        memory.game_play.not_a_matched_tile();
    }
};

memory.game_play.increment_score = function() {
    memory.stats.total_moves += 1;
};

memory.game_play.show_updated_score = function() {
    $('.game_admin_bar .total_moves span').html( memory.stats.total_moves );
};

memory.game_play.matched_a_tile = function() {
    //reset the current number
    memory.game_play.current_number = '';

    $('.active').addClass('match');
    $('.active').removeClass('active');

    memory.cards.match_sets -= 1;
    //console.log('total sets to match: ', memory.cards.match_sets);

    if ( memory.cards.match_sets === 0 ) {
        //console.log('game won');
        memory.game_board.game_won();
        return;
    }
};

memory.game_play.not_a_matched_tile = function() {
    //PREVENT SELECTING A NEW TILE
    memory.game_play.game_paused = true;

    memory.game_play.click_timer = setTimeout(function () {

        memory.game_play.reset_tiles();

    }, 1000);
};

memory.game_play.reset_tiles = function () {
    memory.game_play.current_number = null;
    memory.game_play.current_location = null;

    //HIDE THE IMAGES THAT WERE NOT MATCHED
    $('.active').children('img').addClass('hidden');

    //RESET ACTIVE TILES
    $('.active').removeClass('active');

    //USER CAN NOW SELECT A NEW TILE
    memory.game_play.game_paused = false;
};

//INITIAL GAME SCREEN
$('.player_prompt .join_game').on('click', function() {
    //join game
    //console.log('join game');

    if ( $('.player_name_input').val() < 1 || $('.player_name_input').val() > 20 ) {
        return;
    }
    else {
        memory.firebase.join_game();
    }
});

$('.player_prompt').on('keypress', '.player_name_input', function(e) {
    if (e.keyCode === 13) {
        //join game
        //console.log('join game');

        if ( $('.player_name_input').val() < 1 || $('.player_name_input').val() > 20 ) {
            return;
        }
        else {
            memory.firebase.join_game();
        }
    }
});

//RESET THE GAME BOARD
    $('.memory').on('click','.reset_button',function() {
        memory.game_board.reset();
    });


//RESET THE GAME BOARD
memory.game_board.reset = function() {
    $('.game_board').empty();

    memory.cards.card_array = [];

    memory.reddit.imgur_array = [];

    memory.stats.total_moves = 0;

    memory.cards.match_sets = 5;

    $('.game_admin_bar .total_moves span').html( memory.stats.total_moves );

    memory.game_board.init_game_board();
};


//REDDIT
memory.reddit.fetch_cards_from_reddit = function () {

    $.ajax({
        type: 'GET',
        url: memory.reddit.json_images_url,
        success: function(json_data) {
            memory.reddit.json_data = json_data.data.children;

            loop_json_image_object();
        },
        error: function(e) {
            //console.log(e.message);
        }
    });

    function loop_json_image_object() {

        for ( var i=0; i<memory.reddit.json_data.length; i++) {
            if ( memory.reddit.imgur_array.length >= 5 ) {
                break;
            }

            memory.reddit.image_url = memory.reddit.json_data[i].data.url;

            if ( memory.reddit.image_url.indexOf("imgur.com") >= 0 && memory.reddit.image_url.slice(-4) === '.jpg' ) {

                memory.reddit.imgur_array.push(memory.reddit.image_url);

            }

        }

        //SHUFFLE THE CARDS
        memory.cards.shuffle_cards();

        //LAYOUT THE CARDS
        memory.game_board.layout_cards();

        //ADD BUTTON LISTENERS
        memory.game_play.add_listeners();

    }


};


//FIREBASE
memory.firebase.display_players = function() {

    memory.firebase.matchmaker.child('players').on('child_added', function(snapshot) {
        //console.log( 'added: ',snapshot.val() );
        memory.firebase.add_user_to_list( snapshot );
    });

    memory.firebase.matchmaker.child('players').on('child_removed', function(old_snapshot) {
        //console.log( 'removed: ',old_snapshot.val() );
        memory.firebase.remove_user_from_list( old_snapshot );
    });

};

memory.firebase.join_game = function () {
    //generate user id
    var id_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        memory.firebase.player_id += id_characters.charAt(Math.floor(Math.random() * id_characters.length));
    }

    //add player_name
    var player_name = $('.player_name_input').val();

    //console.log('user id: ', memory.firebase.player_id);
    //console.log('user name: ', player_name);

    memory.firebase.matchmaker.child('players').child(memory.firebase.player_id).set({ player_name : player_name, best_score : 0, games_played : 0 }, function() {

        memory.firebase.display_room();
    });

    memory.firebase.matchmaker.child('players').child(memory.firebase.player_id).onDisconnect().remove();

};


memory.firebase.display_room = function() {

    //HIDE INTRO SCREEN
    $('.player_prompt').hide();

    $('.game_admin_bar').removeClass('hidden');

    memory.game_board.init_game_board();
};

memory.firebase.add_user_to_list = function( snapshot ) {
    var player_id = snapshot.ref().name();

    $('.player_list').append('<div class="player_name" data-userid="' + player_id +'"><span data-username="' + snapshot.val().player_name +'">' + snapshot.val().player_name + '</span>played:<span data-name="games_played">' + snapshot.val().games_played + '</span>games and best score is <span data-name="best_score">' + snapshot.val().best_score + '</span>moves</div>');

    memory.firebase.matchmaker.child('players').on('child_changed', function(snapshot) {
        memory.firebase.broadcast_update(snapshot);
    });
};

memory.firebase.remove_user_from_list = function ( old_snapshot ) {

    //console.log('remove user from list');
    var userid = old_snapshot.ref().name();
    $('.player_list .player_name[data-userid="' + userid + '"]').remove();

};

memory.firebase.send_update = function () {

    memory.firebase.matchmaker.child('players').child(memory.firebase.player_id).update({ moves : memory.stats.total_moves, games_played : memory.stats.games_played, best_score : memory.stats.best_score }, function() {
        //console.log('sent update');
    });

};

memory.firebase.broadcast_update = function( snapshot ) {

    var player_id = snapshot.ref().name();
    var player_name = $('.player_list .player_name[data-userid=' + player_id + '] span[data-username]').attr('data-username');
    var games_played = snapshot.child('games_played').val();
    var moves = snapshot.child('moves').val();
    var best_score = snapshot.child('best_score').val();

    //set games played in player list
    $('.player_list .player_name[data-userid="' + player_id + '"] span[data-name="games_played"').html( games_played );

    //set best score in player list
    $('.player_list .player_name[data-userid="' + player_id + '"] span[data-name="best_score"').html( best_score );

    //show how many moves user won in
    $('.player_list .player_updates').html(player_name + ' just won in ' + moves + ' moves');

};

memory.firebase.display_players();

//memory.game_board.init_game_board();
