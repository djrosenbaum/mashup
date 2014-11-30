var stats = {
    best_score : 0,
    total_moves : 0,
    games_played : 0
};

stats.check_best_score = function() {

    if ( stats.best_score === 0 ) {
        stats.best_score = stats.total_moves;
    }
    else if ( stats.total_moves < stats.best_score ) {
        stats.best_score = stats.total_moves;
    }

};

stats.increment_score = function() {
    stats.total_moves += 1;
};

stats.show_updated_score = function() {
    $('.game_admin_bar .total_moves span').html( stats.total_moves );
};
