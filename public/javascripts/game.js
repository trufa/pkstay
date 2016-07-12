var socket = io.connect(location.href);

var s = {
    char: {
        w: 20,
        h: 20,
        startX: 50,
        startY: 50,
        speed: ((window.innerHeight +  window.innerWidth) *250)/1195
    },
    uuid: uuid.v4(),
    debug: false
};

Crafty.init(document.getElementById('game'));

var revealedDistance = Crafty.e("2D, DOM, Text")
    .attr({ x: window.innerWidth / 2, y: 0 })
    .text("?")
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

var char = Crafty.e('2D, DOM, Color, Fourway, Solid')
    .attr({x: s.char.startX, y: s.char.startY, w: s.char.w, h: s.char.h})
    .color('#F00')
    .fourway(s.char.speed)
    .bind("Move", function(direction) {
        socket.emit('position', {
            uuid: s.uuid,
            x: char.x - (char.w / 2),
            y: char.y - (char.h / 2)
        });
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

socket.on('connect', function () {
    socket.emit('join', {
        uuid: s.uuid,
        windowProps: {
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        }
    });
});

socket.on('distance', function (ditance) {
    revealedDistance.text(ditance);
});

socket.on('foundGoal', function () {
    foundGoalText.toggle();
    char.toggle();
});


