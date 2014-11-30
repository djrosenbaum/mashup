var firebase = {
    matchmaker : new Firebase('https://matchmaker.firebaseio.com/'),
    player_id : '',
    players : null,
    score : null,
};

firebase.display_players = function() {

    firebase.matchmaker.child('players').on('child_added', function(snapshot) {
        //console.log( 'added: ',snapshot.val() );
        firebase.add_user_to_list( snapshot );
    });

    firebase.matchmaker.child('players').on('child_removed', function(old_snapshot) {
        //console.log( 'removed: ',old_snapshot.val() );
        firebase.remove_user_from_list( old_snapshot );
    });

};

firebase.join_game = function () {
    //generate user id
    var id_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        firebase.player_id += id_characters.charAt(Math.floor(Math.random() * id_characters.length));
    }

    //add player_name
    var player_name = $('.player_name_input').val();

    //console.log('user id: ', firebase.player_id);
    //console.log('user name: ', player_name);

    firebase.matchmaker.child('players').child(firebase.player_id).set({ player_name : player_name, best_score : 0, games_played : 0 }, function() {

        firebase.display_room();
    });

    firebase.matchmaker.child('players').child(firebase.player_id).onDisconnect().remove();

};

firebase.display_room = function() {

    //HIDE INTRO SCREEN
    $('.player_prompt').hide();

    $('.game_admin_bar').removeClass('hidden');

    //CREATE A NEW DECK WITH X CARDS TO MATCH
    new_deck = new Card_deck( 5 );

    //FETCH CARDS FROM REDDIT
    dealer.request_images_from_reddit();
};

firebase.add_user_to_list = function( snapshot ) {
    var player_id = snapshot.ref().name();

    $('.player_list').append('<div class="player_name" data-userid="' + player_id +'"><span data-username="' + snapshot.val().player_name +'">' + snapshot.val().player_name + '</span>played:<span data-name="games_played">' + snapshot.val().games_played + '</span>games and best score is <span data-name="best_score">' + snapshot.val().best_score + '</span>moves</div>');

    firebase.matchmaker.child('players').on('child_changed', function(snapshot) {
        firebase.broadcast_update(snapshot);
    });
};

firebase.remove_user_from_list = function ( old_snapshot ) {

    //console.log('remove user from list');
    var userid = old_snapshot.ref().name();
    $('.player_list .player_name[data-userid="' + userid + '"]').remove();

};

firebase.send_update = function () {

    firebase.matchmaker.child('players').child(firebase.player_id).update({ moves : stats.total_moves, games_played : stats.games_played, best_score : stats.best_score }, function() {
        //console.log('sent update');
    });

};

firebase.broadcast_update = function( snapshot ) {

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
