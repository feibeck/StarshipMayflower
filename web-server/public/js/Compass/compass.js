define(['paper'], function(paper) {

    var Compass = function(id) {

        this.domElement = document.createElement('canvas');
        this.domElement.width = 400;
        this.domElement.height = 400;

        this.outerRingSize = 55;
        this.radius = Math.min(this.domElement.width, this.domElement.height);

        paper.setup(this.domElement);

        this.createPitchDisplay();
        this.createRollDisplay();
        this.createJawDisplay();

        this.currentRoll = 0;
        this.currentJaw = 0;
        this.currentPitch = 0;
        this.pitchAxisCenter = paper.view.center;

        this.currentPitchVector = new paper.Point(0, 0);

        paper.view.draw();

    }

    Compass.prototype.getDomElement = function() {
        return this.domElement;
    };

    Compass.prototype.pitch = function(angle) {

        this.currentPitch = angle;

        var moveAngle = this.currentRoll + 90;
        if (angle > 180) {
            moveAngle += 180;
        }

        var length = this.degreeToPixel() * angle;

        var moveVector = new paper.Point({
            length: length,
            angle: moveAngle
        });

        this.xyGroup.setPosition(this.xyGroup.position.subtract(this.currentPitchVector));
        this.xyGroup.setPosition(this.xyGroup.position.add(moveVector));

        this.currentPitchVector = moveVector;

        this.xyGroup.setPivot(paper.view.center);
        this.clippingCircle.setPosition(paper.view.center);

    };

    Compass.prototype.draw = function() {
        paper.view.draw();
    };

    Compass.prototype.degreeToPixel = function() {
        var range = this.radius - 2 * this.outerRingSize;
        var pixelPerDegree = (range / 90);

        return pixelPerDegree;
    };

    Compass.prototype.roll = function(angle) {

        var currentPitch = this.currentPitch;
        this.pitch(0);

        this.xyGroup.setPivot(paper.view.center);
        this.xyGroup.rotate(-this.currentRoll);

        this.currentRoll = angle;
        this.xyGroup.rotate(angle);
        this.labelRollAngle.content = Math.round(angle) + '°';

        this.pitch(currentPitch);
    };

    Compass.prototype.jaw = function(angle) {
        this.xzGroup.setPivot(paper.view.center);
        this.xzGroup.rotate(-this.currentJaw);
        this.currentJaw = angle + 180;
        this.xzGroup.rotate(this.currentJaw);
    };

    Compass.prototype.createPitchDisplay = function() {

        var xyScale = [];

        this.clippingCircle = new paper.Path.Circle({
            center: paper.view.center,
            radius: (this.radius / 2 - this.outerRingSize)
        });
        xyScale.push(this.clippingCircle);

        var pixelPerDegree = this.degreeToPixel();

        for (var i = -180; i < 180; i += 10) {
            if (i == 0) {
                continue;
            }
            var color = 'blue';
            if (i > 0) {
                color = 'brown';
            }
            xyScale.push(new paper.Path({
                segments: [
                    [
                        paper.view.center.x - 20,
                        paper.view.center.y + i * pixelPerDegree
                    ],
                    [
                        paper.view.center.x + 20,
                        paper.view.center.y + i * pixelPerDegree
                    ]
                ],
                strokeColor: color
            }));

            xyScale.push(new paper.PointText({
                point: [
                    paper.view.center.x + 25,
                    paper.view.center.y + i * pixelPerDegree + 3
                ],
                content: ((i * -1 + 360) % 360) + '°',
                fillColor: color,
                fontSize: 6
            }));
        }

        xyScale.push(new paper.Path({
            segments: [
                [paper.view.center.x - 100, paper.view.center.y],
                [paper.view.center.x + 100, paper.view.center.y]
            ],
            strokeColor: '#c0c0c0'
        }));

        this.xyGroup = new paper.Group({
            children: xyScale,
            clipped: true
        });

    };

    Compass.prototype.createRollDisplay = function() {
        var redLine = new paper.Path(
            [paper.view.center.x - 35, paper.view.center.y],
            [paper.view.center.x - 5, paper.view.center.y],
            [paper.view.center.x, paper.view.center.y + 5],
            [paper.view.center.x + 5, paper.view.center.y],
            [paper.view.center.x + 35, paper.view.center.y]
        );
        redLine.strokeColor = 'red';

        this.labelRollAngle = new paper.PointText({
            point: [paper.view.center.x - 60, paper.view.center.y + 3],
            content: 0 + '°',
            fillColor: 'red',
            fontFamily: 'Arial',
            fontSize: 6
        });
    };

    Compass.prototype.createJawDisplay = function() {

        var r = this.radius / 2 - this.outerRingSize;

        var xzScale = [];

        for (var i = 0; i < 360; i += 10) {

            var a = i * (Math.PI/180);

            var length = 20;
            if (i == 0 || i == 90 || i == 180 || i == 270) {
                length = 30;
            }

            var color = '#c0c0c0';
            if (i == 0) {
                color = 'red';
            }

            var px1 = paper.view.center.x + Math.sin(a) * r;
            var py1 = paper.view.center.y + Math.cos(a) * r;
            var px2 = paper.view.center.x + Math.sin(a) * (r + length);
            var py2 = paper.view.center.y + Math.cos(a) * (r + length);

            xzScale.push(new paper.Path({
                segments: [[px1, py1], [px2, py2]],
                strokeColor: color
            }));

            var text = new paper.PointText({
                content: i + '°',
                fillColor: '#c0c0c0',
                fontFamily: 'Arial',
                fontSize: 6
            });
            text.rotate(90 - i);

            text.pivot = text.bounds.leftCenter;

            var px3 = paper.view.center.x + Math.sin(a) * (r + length + 3);
            var py3 = paper.view.center.y + Math.cos(a) * (r + length + 3);

            text.position = new paper.Point(px3, py3);
            xzScale.push(text);
        };

        this.xzGroup = new paper.Group({
            children: xzScale
        });
    };

    return Compass;

});