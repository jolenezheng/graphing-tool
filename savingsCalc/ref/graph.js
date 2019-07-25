"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.coords = {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
        };
    }
    return Point;
}());
exports.Point = Point;
function isLine(obj) {
    return "line" in obj.css;
}
exports.isLine = isLine;
function isNumber(obj) {
    return !isNaN(Number(obj));
    // return !isNaN(parseFloat(obj)) && !isNaN(obj - 0);
}
function createAccessibilityTable(options, dataSet, accessibilityTableDiv) {
    var numSeries = dataSet.length;
    var clustered = options.axisOptions.xAxis.clusterNames;
    var xPoints = clustered
        ? options.axisOptions.xAxis.clusterNames.length
        : options.axisOptions.xAxis.range[1] / options.axisOptions.xAxis.ticks;
    // tslint:disable-next-line:one-variable-per-declaration
    var table, tr, td, th;
    table = document.createElement("TABLE");
    table.setAttribute("id", options.title + "-table-content");
    table.border = "1";
    for (var i = -1; i < numSeries; i++) {
        if (i === -1) {
            tr = document.createElement("TR");
            table.appendChild(tr);
            th = document.createElement("TH");
            th.setAttribute("scope", "col");
            th.appendChild(document.createTextNode(options.axisOptions.xAxis.name));
            tr.appendChild(th);
            for (var j = 0; j < xPoints; j++) {
                tr = document.createElement("TR");
                table.appendChild(tr);
                th = document.createElement("TH");
                th.setAttribute("scope", "row");
                if (clustered) {
                    th.appendChild(document.createTextNode(options.axisOptions.xAxis.clusterNames[j]));
                }
                else {
                    th.appendChild(document.createTextNode((xPoints * j).toString()));
                }
                tr.appendChild(th);
            }
        }
        else {
            for (var j = 0; j < xPoints; j++) {
                if (j === 0) {
                    th = document.createElement("TH");
                    th.setAttribute("scope", "col");
                    th.appendChild(document.createTextNode(dataSet[i].css.name));
                    table.getElementsByTagName("tr")[j].appendChild(th);
                }
                td = document.createElement("TD");
                td.appendChild(document.createTextNode(dataSet[i].points[j].y.toString()));
                table.getElementsByTagName("tr")[j + 1].appendChild(td);
            }
        }
    }
    accessibilityTableDiv.appendChild(table);
}
function setUpEventListeners(canvas, events, dataSet) {
    canvas.addEventListener("mousemove", function (e) {
        var userX = e.clientX - canvas.offsetLeft;
        var userY = e.clientY - canvas.offsetTop;
        var numData = dataSet.length;
        var numPoints = 0;
        var onData = false;
        for (var i = 0; i < numData; i++) {
            numPoints = dataSet[i].points.length;
            for (var j = 0; j < numPoints; j++) {
                if (userX >= dataSet[i].points[j].coords.x1 &&
                    userX <= dataSet[i].points[j].coords.x2 &&
                    userY >= dataSet[i].points[j].coords.y1 &&
                    userY <= dataSet[i].points[j].coords.y2) {
                    onData = true;
                    events.hoverOn(dataSet[i].css.name, dataSet[i].points[j].x, dataSet[i].points[j].y, userX, userY);
                    return;
                }
            }
        }
        if (!onData) {
            events.hoverOff();
        }
    });
    canvas.addEventListener("mousedown", function (e) {
        var userX = e.clientX - canvas.offsetLeft;
        var userY = e.clientY - canvas.offsetTop;
        var numData = dataSet.length;
        var numPoints = 0;
        var onData = false;
        for (var i = 0; i < numData; i++) {
            numPoints = dataSet[i].points.length;
            for (var j = 0; j < numPoints; j++) {
                if (userX >= dataSet[i].points[j].coords.x1 &&
                    userX <= dataSet[i].points[j].coords.x2 &&
                    userY >= dataSet[i].points[j].coords.y1 &&
                    userY <= dataSet[i].points[j].coords.y2) {
                    onData = true;
                    events.clickOn(dataSet[i].css.name, dataSet[i].points[j].x, dataSet[i].points[j].y, userX, userY);
                    return;
                }
            }
        }
        if (!onData) {
            events.clickOff();
        }
    });
}
/** Draws the graph's grid lines and writes in the axis metrics */
function drawGrid(ctx, width, height, css, padding, axisOptions, hasBars) {
    var xGap = hasBars
        ? (width - padding.left - padding.right) / (axisOptions.xAxis.ticks + 1)
        : (width - padding.left - padding.right) / axisOptions.xAxis.ticks; // Distance between each x-axis tick
    var yGap = (height - padding.top - padding.bottom) / axisOptions.yAxis.ticks; // Distance between each y-axis tick
    var xScaleInterval = axisOptions.xAxis.range[1] / axisOptions.xAxis.ticks; // Increase in x metrics
    var yScaleInterval = axisOptions.yAxis.range[1] / axisOptions.yAxis.ticks; // Increase in y metrics
    var xAlign = hasBars ? xGap / 2 : 0; // to centre x-axis for bar graphs
    var numCenter = 4; // Pixels needed to centre a 1 digit number
    var currMetric = ""; // Tracks the current number being drawn on
    var fontSize = isNumber(css.numbers.size) ? css.numbers.size.toString() + "px" : css.numbers.size;
    // Draw x-axis gridlines and metrics
    ctx.font = fontSize + " " + css.numbers.font;
    // Adding 0.5 to ctx.moveTo and lineTo makes lines more crisp
    for (var i = 0; i <= axisOptions.xAxis.ticks; i++) {
        if (axisOptions.xAxis.clusterNames) {
            currMetric = axisOptions.xAxis.clusterNames[i];
        }
        else {
            currMetric = css.numbers.format ? css.numbers.format(xScaleInterval * i) : (xScaleInterval * i).toString();
        }
        ctx.textAlign = "left";
        ctx.fillStyle = css.numbers.colour;
        ctx.fillText(currMetric.toString(), xGap * i + padding.left - currMetric.toString().length * numCenter + xAlign, height - padding.bottom + css.numbers.padding);
        i === 0 ? (ctx.lineWidth = css.axisLineWidth) : (ctx.lineWidth = css.gridLineWidth);
        // Fix implementation for drawing x-gridlines when there are bars (kinda hacky)
        // Only draw gridline if it's the axis line, or if indicated in options
        if (axisOptions.xAxis.drawGridLines || i === 0) {
            ctx.beginPath();
            if (i === 0) {
                // Draw x-axis line
                ctx.strokeStyle = css.axisLineColour;
                ctx.moveTo(xGap * i + padding.left, height - padding.bottom);
                ctx.lineTo(xGap * i + padding.left, padding.top);
                ctx.stroke();
                if (axisOptions.xAxis.drawGridLines && hasBars) {
                    ctx.lineWidth = css.gridLineWidth;
                    ctx.strokeStyle = css.gridLineColour;
                    // Draw first gridline
                    ctx.moveTo(xGap * i + padding.left + xAlign, height - padding.bottom);
                    ctx.lineTo(xGap * i + padding.left + xAlign, padding.top);
                    ctx.stroke();
                    // Draw last line
                    ctx.moveTo(xGap * (axisOptions.xAxis.ticks + 0.5) + padding.left + xAlign + 0.5, height - padding.bottom);
                    ctx.lineTo(xGap * (axisOptions.xAxis.ticks + 0.5) + padding.left + xAlign + 0.5, padding.top);
                }
            }
            else {
                if (hasBars) {
                    ctx.moveTo(xGap * i + padding.left + xAlign + 0.5, height - padding.bottom);
                    ctx.lineTo(xGap * i + padding.left + xAlign + 0.5, padding.top);
                }
                else {
                    ctx.moveTo(xGap * i + padding.left + 0.5, height - padding.bottom);
                    ctx.lineTo(xGap * i + padding.left + 0.5, padding.top);
                }
            }
            ctx.stroke();
        }
    }
    // Draw y-axis gridlines and metrics
    ctx.font = fontSize + " " + css.numbers.font;
    ctx.textAlign = "right";
    for (var i = 0; i <= axisOptions.yAxis.ticks; i++) {
        if (axisOptions.yAxis.clusterNames) {
            currMetric = axisOptions.yAxis.clusterNames[i];
        }
        else {
            currMetric = css.numbers.format ? css.numbers.format(yScaleInterval * i) : (yScaleInterval * i).toString();
        }
        ctx.fillStyle = css.numbers.colour;
        ctx.fillText(currMetric.toString(), padding.left - css.numbers.padding, height - padding.bottom - yGap * i + numCenter);
        if (axisOptions.yAxis.drawGridLines || i === 0) {
            if (i === 0) {
                ctx.lineWidth = css.axisLineWidth;
                ctx.strokeStyle = css.axisLineColour;
            }
            else {
                ctx.lineWidth = css.gridLineWidth;
                ctx.strokeStyle = css.gridLineColour;
            }
            ctx.beginPath();
            ctx.moveTo(padding.left + 0.5, height - padding.bottom - yGap * i);
            ctx.lineTo(width - padding.right + 0.5, height - padding.bottom - yGap * i);
            ctx.stroke();
        }
    }
}
exports.drawGrid = drawGrid;
/** Draws in the graph's main title and axis labels */
function drawTitles(ctx, width, height, padding, title, css, titleText, xText, yText) {
    var fontSize = isNumber(css.title.size) ? css.title.size.toString() + "px" : css.title.size;
    var titleSize = isNumber(title.size) ? title.size.toString() + "px" : title.size;
    var titleAlign;
    var xLabelAlign;
    var yLabelAlign;
    switch (title.textAlign) {
        case "center":
            titleAlign = width / 2;
            break;
        case "left":
            titleAlign = padding.left;
            break;
        case "right":
            titleAlign = width - padding.right;
    }
    switch (css.title.xLabelTextAlign) {
        case "center":
            xLabelAlign = width / 2;
            break;
        case "left":
            xLabelAlign = padding.left;
            break;
        case "right":
            xLabelAlign = width - padding.right;
    }
    switch (css.title.yLabelTextAlign) {
        case "center":
            yLabelAlign = height / 2;
            break;
        case "left":
            yLabelAlign = height - padding.bottom;
            break;
        case "right":
            yLabelAlign = padding.top;
    }
    // Draw x-label
    ctx.font = css.title.weight + " " + fontSize + " " + css.title.font;
    ctx.fillStyle = css.title.colour;
    if (css.title.xPos && css.title.yPos) {
        ctx.fillText(xText, css.title.xPos, css.title.yPos);
    }
    else {
        ctx.textAlign = css.title.xLabelTextAlign;
        ctx.fillText(xText, xLabelAlign, height - (padding.bottom - css.numbers.padding) / 2);
    }
    // Draw y-label
    ctx.font = css.title.weight + " " + fontSize + " " + css.title.font;
    ctx.fillStyle = css.title.colour;
    if (css.title.rotateYLabel) {
        ctx.save();
        ctx.translate((padding.left - css.numbers.padding) / 2, yLabelAlign);
        ctx.rotate((Math.PI * 3) / 2);
        ctx.textAlign = css.title.yLabelTextAlign;
        ctx.fillText(yText, 0, 0);
        ctx.restore();
    }
    else if (css.title.yLabelTextAlign) {
        ctx.textAlign = "center";
        ctx.fillText(yText, (padding.left - css.numbers.padding) / 2, height / 2);
    }
    else {
        ctx.fillText(yText, css.title.xPos, css.title.yPos);
    }
    // Draw title
    ctx.font = title.weight + " " + titleSize + " " + title.font;
    ctx.fillStyle = title.colour;
    if (title.textAlign) {
        ctx.textAlign = title.textAlign;
        ctx.fillText(titleText, titleAlign, padding.top / 2);
    }
    else {
        ctx.fillText(titleText, title.xPos, title.yPos);
    }
}
exports.drawTitles = drawTitles;
function addCoordToPoint(p, x, y, width, height) {
    p.coords.x1 = x;
    p.coords.x2 = x + width;
    p.coords.y1 = y;
    p.coords.y2 = y + height;
}
exports.addCoordToPoint = addCoordToPoint;
/** Draws data points and connecting lines for the current line being passed in */
function drawLine(ctx, width, height, points, padding, currSeries, xTicks, xMax, yMax, hasBars) {
    var numPoints = points.length;
    var pointCenter = currSeries.css.points.size / 2;
    var xGap = hasBars
        ? (width - padding.left - padding.right) / (xMax + xMax / xTicks)
        : (width - padding.left - padding.right) / xMax; // Pixels per 1 unit in relation to the x-axis
    var yGap = (height - padding.top - padding.bottom) / yMax; // Pixels per 1 unit in relation to the y-axis
    var xAlign = hasBars ? (xGap * 10) / 2 : 0; // Draws points according to x-axis alignment for bar graphs
    // tslint:disable-next-line:one-variable-per-declaration
    var currX, currY, xMid, yMid, x1Control, x2Control, nextX, nextY; // used for drawing curves
    ctx.fillStyle = currSeries.css.points.colour;
    ctx.strokeStyle = currSeries.css.line.colour;
    ctx.lineWidth = currSeries.css.line.width;
    for (var i = 0; i < numPoints; i++) {
        currX = padding.left + points[i].x * xGap + xAlign;
        currY = height - padding.bottom - points[i].y * yGap;
        if (i !== numPoints - 1) {
            // Prevents index out of range when drawing line
            if (!currSeries.css.line.curved) {
                // Draw stright line connecting dots
                ctx.beginPath();
                ctx.moveTo(currX, currY);
                ctx.lineTo(padding.left + points[i + 1].x * xGap + xAlign, height - padding.bottom - points[i + 1].y * yGap);
                ctx.stroke();
            }
            else {
                // Draw curved line connecting dots
                nextX = padding.left + points[i + 1].x * xGap + xAlign;
                nextY = height - padding.bottom - points[i + 1].y * yGap;
                xMid = (currX + nextX) / 2;
                yMid = (currY + nextY) / 2;
                x1Control = (xMid + currX) / 2; // Control point for first half of curve
                x2Control = (xMid + nextX) / 2; // Control point for second half of curve
                ctx.beginPath();
                ctx.moveTo(currX, currY);
                ctx.quadraticCurveTo(x1Control, currY, xMid, yMid);
                ctx.quadraticCurveTo(x2Control, nextY, nextX, nextY);
                ctx.stroke();
            }
        }
        // Draw points
        ctx.fillRect(padding.left + points[i].x * xGap - pointCenter + xAlign, height - padding.bottom - points[i].y * yGap - pointCenter, currSeries.css.points.size, currSeries.css.points.size);
        addCoordToPoint(points[i], padding.left + points[i].x * xGap - pointCenter + xAlign, height - padding.bottom - points[i].y * yGap - pointCenter, currSeries.css.points.size, currSeries.css.points.size);
    }
}
exports.drawLine = drawLine;
/** Draws bars for the current bar-variable passed in */
function drawBars(ctx, width, height, bars, padding, numBarSets, xMax, yMax, currBar) {
    var numBars = bars.points.length; // number of bars in current data set
    var barCenter = (bars.css.bar.width / 2) * numBarSets;
    var xGap = (width - padding.left - padding.right) / (xMax + 10);
    var yGap = (height - padding.top - padding.bottom) / yMax;
    var xAlign = (xGap * 10) / 2; // to centre x-axis for bar graphs
    var barStart = bars.css.bar.width * currBar;
    ctx.fillStyle = bars.css.bar.colour;
    for (var i = 0; i < numBars; i++) {
        ctx.fillRect(padding.left + bars.points[i].x * xGap - barCenter + xAlign + barStart, height - padding.bottom - bars.points[i].y * yGap, bars.css.bar.width, bars.points[i].y * yGap);
        addCoordToPoint(bars.points[i], padding.left + bars.points[i].x * xGap - barCenter + xAlign + barStart, height - padding.bottom - bars.points[i].y * yGap, bars.css.bar.width, bars.points[i].y * yGap);
    }
}
exports.drawBars = drawBars;
/**
 * drawGraph: Main function that's called everytime the graph is updated
 * @param {IGraphOptions} options: options for the graph
 * @param {ICss} css: CSS/style settings for the graph
 * @param {Array<ILine | IBar>} lines: array of lines and/or bars for the graph
 */
function drawGraph(canvas, options, css, dataSet, accessibilityTableDiv) {
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var totalSetsToDraw = dataSet.length;
    var barSetsToDraw = dataSet.filter(function (data) { return "bar" in data.css; }).length;
    var currBar = 0;
    var hasBars = barSetsToDraw > 0 ? true : false;
    // Apply canvas styles
    ctx.fillStyle = css.canvasCss.background.colour;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = css.canvasCss.border.colour;
    ctx.lineWidth = css.canvasCss.border.width;
    ctx.strokeRect(0, 0, width, height);
    drawTitles(ctx, width, height, css.canvasCss.padding, css.titleCss, css.axisCss, options.title, options.axisOptions.xAxis.name, options.axisOptions.yAxis.name);
    drawGrid(ctx, width, height, css.axisCss, css.canvasCss.padding, options.axisOptions, hasBars);
    for (var i = 0; i < totalSetsToDraw; i++) {
        var series = dataSet[i];
        if (isLine(series)) {
            drawLine(ctx, width, height, series.points, css.canvasCss.padding, series, options.axisOptions.xAxis.ticks, options.axisOptions.xAxis.range[1], options.axisOptions.yAxis.range[1], hasBars);
        }
        else {
            drawBars(ctx, width, height, series, css.canvasCss.padding, barSetsToDraw, options.axisOptions.xAxis.range[1], options.axisOptions.yAxis.range[1], currBar);
        }
        if (!isLine(series))
            currBar++;
    }
    setUpEventListeners(canvas, options.events, dataSet);
    createAccessibilityTable(options, dataSet, accessibilityTableDiv);
}
exports.drawGraph = drawGraph;
//# sourceMappingURL=graph.js.map