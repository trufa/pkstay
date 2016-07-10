var s = {
    char: {
        w: 20,
        h: 20,
        startX: 50,
        startY: 50,
        speed: 200
    },
    goal: {
        w: 20,
        h: 20
    },
    game: {
        radius: 80
    },
    debug: false
};

Crafty.init(document.getElementById('game'));
Crafty.viewport.bounds = {min:{x:0, y:0}, max:{x:500, y:500}};

var getRevealedDistance = function() {
    if (!char) {
        return "?";
    }
    var distance = Crafty.math.distance(
        char.x - (char.w / 2),
        char.y - (char.h / 2),
        goal.x - (goal.w / 2),
        goal.y - (goal.h / 2));
    return parseInt(distance / s.game.radius);
};

var getRandomPosition = function() {
    var randX = Math.floor(Math.random() * Math.floor(window.innerWidth)) + 1;
    var randY = Math.floor(Math.random() * Math.floor(window.innerHeight)) + 1;
    return {
        x: randX,
        y: randY
    };
};

var revealedDistance = Crafty.e("2D, DOM, Text")
    .attr({ x: window.innerWidth / 2, y: 0 })
    .text(getRevealedDistance())
    .textFont({ size: '50px', weight: 'bold' });


var foundGoalText = Crafty.e("2D, DOM, Text")
    .attr({ x: (window.innerWidth / 2) - 100, y: 60, w: 200 })
    .text("Got there! Go again!")
    .textFont({ size: '20px', weight: 'bold' })
    .attr({alpha: 0})
    .extend({
        toggle: function() {
            var that = this;
            that.attr({alpha: 1});
            setTimeout(function() {
                that.attr({alpha: 0});
            }, 3000);
        }
    });

var foundGoal = function() {
    foundGoalText.toggle();
    char.toggle();
    goal.setInRandomPosition();
};

var char = Crafty.e('2D, DOM, Color, Fourway, Solid')
    .attr({x: s.char.startX, y: s.char.startY, w: s.char.w, h: s.char.h})
    .color('#F00')
    .fourway(s.char.speed)
    .bind("Move", function(direction) {
        revealedDistance.text(getRevealedDistance());
    })
    .extend({
        toggle: function() {
            var that = this;
            that.color("red");

            setTimeout(function() {
                that.color("#F00");
            }, 1000);
        }
    });

var goal = Crafty.e('2D, DOM, Color, Collision')
    .attr(getRandomPosition())
    .attr({w: s.goal.w, h: s.goal.h})
    .attr(function() {
        return s.debug ? {alpha: 1} : {alpha: 0};
    }())
    //.attr({alpha: 0})
    .color('gray')
    .checkHits('Solid') // check for collisions with entities that have the Solid component in each frame
    .bind("HitOn", function(hitData) {
        foundGoal();
    })
    .extend({
        setInRandomPosition: function() {
            this.attr(getRandomPosition());
        }
    });