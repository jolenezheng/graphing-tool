// import { animate } from "./animations";

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ------------------------------- point class ---------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
class Point {
    public x: number;
    public y: number;
    public coords: {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
    };

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.coords = {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
        };
    }
}

interface ILine {
    points: Point[];
    css: {
        name?: string;
        line: {
            width: number;
            colour: string;
            curved?: boolean;
        };
        points: {
            colour: string;
            size: number;
        };
    };
}

interface IBar {
    points: Point[];
    css: {
        name?: string;
        bar: {
            width: number;
            colour: string;
        };
    };
}

interface IAxisOptions {
    xAxis: {
        name: string;
        drawGridLines: boolean;
        range?: number[]; // [min, max]
        ticks: number;
        clusterNames?: string[];
    };
    yAxis: {
        name: string;
        drawGridLines: boolean;
        range?: number[];
        ticks: number;
        clusterNames?: string[];
    };
}

interface IEvents {
    hoverOn?: (dataName: string, x: number, y: number, xPos: number, yPos: number) => void;
    hoverOff?: () => void;
    clickOn?: (dataName: string, x: number, y: number, xPos: number, yPos: number) => void;
    clickOff?: () => void;
}

interface IGraphOptions {
    title: string;
    autoResize: boolean;
    axisOptions: IAxisOptions;
    pixelRatio?: number;
    events?: IEvents;
}

interface ITextStyles {
    font: string;
    weight: number | string;
    size: number | string;
    colour: string;
    rotateYLabel?: boolean;
    xLabelTextAlign: string;
    yLabelTextAlign: string;
    xPos?: number; // xPos and yPos will override textAlign
    yPos?: number;
}

interface INumberStyles {
    // why does this function need to extend ITextStyles?
    format?: (currNum: number) => string;
    font: string;
    size: number | string;
    padding?: number;
    colour?: string;
}

interface IAxisCss {
    axisLineWidth?: number;
    axisLineColour?: string;
    gridLineWidth?: number;
    gridLineColour?: string;
    title: ITextStyles;
    numbers: INumberStyles;
}

interface IPadding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

interface ICanvasCss {
    border: {
        colour: string;
        width: number;
    };
    padding: IPadding;
    background: {
        colour: string;
        axis: string;
        values: string;
    };
}

interface ITitleCss {
    font: string;
    weight: number | string;
    size: number | string;
    colour: string;
    textAlign: string;
    xPos?: number;
    yPos?: number;
}

interface ICss {
    titleCss: ITitleCss;
    canvasCss: ICanvasCss;
    axisCss: IAxisCss;
}

function isLine(obj: ILine | IBar): obj is ILine {
    return "line" in obj.css;
}

function isNumber(obj: number | string): obj is number {
    return !isNaN(Number(obj));
    // return !isNaN(parseFloat(obj)) && !isNaN(obj - 0);
}

function createAccessibilityTable(
    options: IGraphOptions,
    dataSet: (IBar | ILine)[],
    accessibilityTableDiv: HTMLElement,
): void {
    const numSeries = dataSet.length;
    const clustered = options.axisOptions.xAxis.clusterNames;
    const xPoints = clustered
        ? options.axisOptions.xAxis.clusterNames.length
        : options.axisOptions.xAxis.range[1] / options.axisOptions.xAxis.ticks;
    // tslint:disable-next-line:one-variable-per-declaration
    let table, tr, td, th;

    table = document.createElement("TABLE") as HTMLTableElement;
    table.setAttribute("id", options.title + "-table-content");
    table.border = "1";

    for (let i = -1; i < numSeries; i++) {
        if (i === -1) {
            tr = document.createElement("TR");
            table.appendChild(tr);
            th = document.createElement("TH");
            th.setAttribute("scope", "col");
            th.appendChild(document.createTextNode(options.axisOptions.xAxis.name));
            tr.appendChild(th);

            for (let j = 0; j < xPoints; j++) {
                tr = document.createElement("TR");
                table.appendChild(tr);
                th = document.createElement("TH");
                th.setAttribute("scope", "row");
                if (clustered) {
                    th.appendChild(document.createTextNode(options.axisOptions.xAxis.clusterNames[j]));
                } else {
                    th.appendChild(document.createTextNode((xPoints * j).toString()));
                }
                tr.appendChild(th);
            }
        } else {
            for (let j = 0; j < xPoints; j++) {
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

function setUpEventListeners(canvas: HTMLCanvasElement, events: IEvents, dataSet: (ILine | IBar)[]): void {
    canvas.addEventListener("mousemove", (e: MouseEvent) => {
        const userX = e.clientX - canvas.offsetLeft;
        const userY = e.clientY - canvas.offsetTop;
        const numData = dataSet.length;
        let numPoints = 0;
        let onData = false;

        for (let i = 0; i < numData; i++) {
            numPoints = dataSet[i].points.length;
            for (let j = 0; j < numPoints; j++) {
                if (
                    userX >= dataSet[i].points[j].coords.x1 &&
                    userX <= dataSet[i].points[j].coords.x2 &&
                    userY >= dataSet[i].points[j].coords.y1 &&
                    userY <= dataSet[i].points[j].coords.y2
                ) {
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
    canvas.addEventListener("mousedown", (e: MouseEvent) => {
        const userX = e.clientX - canvas.offsetLeft;
        const userY = e.clientY - canvas.offsetTop;
        const numData = dataSet.length;
        let numPoints = 0;
        let onData = false;

        for (let i = 0; i < numData; i++) {
            numPoints = dataSet[i].points.length;
            for (let j = 0; j < numPoints; j++) {
                if (
                    userX >= dataSet[i].points[j].coords.x1 &&
                    userX <= dataSet[i].points[j].coords.x2 &&
                    userY >= dataSet[i].points[j].coords.y1 &&
                    userY <= dataSet[i].points[j].coords.y2
                ) {
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
function drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    css: IAxisCss,
    padding: IPadding,
    axisOptions: IAxisOptions,
    hasBars: boolean,
): void {
    const xGap = hasBars
        ? (width - padding.left - padding.right) / (axisOptions.xAxis.ticks + 1)
        : (width - padding.left - padding.right) / axisOptions.xAxis.ticks; // Distance between each x-axis tick
    const yGap = (height - padding.top - padding.bottom) / axisOptions.yAxis.ticks; // Distance between each y-axis tick
    const xScaleInterval = axisOptions.xAxis.range[1] / axisOptions.xAxis.ticks; // Increase in x metrics
    const yScaleInterval = axisOptions.yAxis.range[1] / axisOptions.yAxis.ticks; // Increase in y metrics
    const xAlign = hasBars ? xGap / 2 : 0; // to centre x-axis for bar graphs

    const numCenter = 4; // Pixels needed to centre a 1 digit number
    let currMetric = ""; // Tracks the current number being drawn on
    const fontSize = isNumber(css.numbers.size) ? css.numbers.size.toString() + "px" : css.numbers.size;

    // Draw x-axis gridlines and metrics
    ctx.font = fontSize + " " + css.numbers.font;

    // Adding 0.5 to ctx.moveTo and lineTo makes lines more crisp
    for (let i = 0; i <= axisOptions.xAxis.ticks; i++) {
        if (axisOptions.xAxis.clusterNames) {
            currMetric = axisOptions.xAxis.clusterNames[i];
        } else {
            currMetric = css.numbers.format ? css.numbers.format(xScaleInterval * i) : (xScaleInterval * i).toString();
        }

        ctx.textAlign = "left";
        ctx.fillStyle = css.numbers.colour;
        ctx.fillText(
            currMetric.toString(),
            xGap * i + padding.left - currMetric.toString().length * numCenter + xAlign,
            height - padding.bottom + css.numbers.padding,
        );

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
                    ctx.moveTo(
                        xGap * (axisOptions.xAxis.ticks + 0.5) + padding.left + xAlign + 0.5,
                        height - padding.bottom,
                    );
                    ctx.lineTo(xGap * (axisOptions.xAxis.ticks + 0.5) + padding.left + xAlign + 0.5, padding.top);
                }
            } else {
                if (hasBars) {
                    ctx.moveTo(xGap * i + padding.left + xAlign + 0.5, height - padding.bottom);
                    ctx.lineTo(xGap * i + padding.left + xAlign + 0.5, padding.top);
                } else {
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

    for (let i = 0; i <= axisOptions.yAxis.ticks; i++) {
        if (axisOptions.yAxis.clusterNames) {
            currMetric = axisOptions.yAxis.clusterNames[i];
        } else {
            currMetric = css.numbers.format ? css.numbers.format(yScaleInterval * i) : (yScaleInterval * i).toString();
        }
        ctx.fillStyle = css.numbers.colour;
        ctx.fillText(
            currMetric.toString(),
            padding.left - css.numbers.padding,
            height - padding.bottom - yGap * i + numCenter,
        );

        if (axisOptions.yAxis.drawGridLines || i === 0) {
            if (i === 0) {
                ctx.lineWidth = css.axisLineWidth;
                ctx.strokeStyle = css.axisLineColour;
            } else {
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

/** Draws in the graph's main title and axis labels */
function drawTitles(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: IPadding,
    title: ITitleCss,
    css: IAxisCss,
    titleText: string,
    xText: string,
    yText: string,
): void {
    const fontSize = isNumber(css.title.size) ? css.title.size.toString() + "px" : css.title.size;
    const titleSize = isNumber(title.size) ? title.size.toString() + "px" : title.size;
    let titleAlign: number;
    let xLabelAlign: number;
    let yLabelAlign: number;

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
    } else {
        ctx.textAlign = css.title.xLabelTextAlign as CanvasTextAlign;
        ctx.fillText(xText, xLabelAlign, height - (padding.bottom - css.numbers.padding) / 2);
    }

    // Draw y-label
    ctx.font = css.title.weight + " " + fontSize + " " + css.title.font;
    ctx.fillStyle = css.title.colour;

    if (css.title.rotateYLabel) {
        ctx.save();
        ctx.translate((padding.left - css.numbers.padding) / 2, yLabelAlign);
        ctx.rotate((Math.PI * 3) / 2);
        ctx.textAlign = css.title.yLabelTextAlign as CanvasTextAlign;
        ctx.fillText(yText, 0, 0);
        ctx.restore();
    } else if (css.title.yLabelTextAlign) {
        ctx.textAlign = "center";
        ctx.fillText(yText, (padding.left - css.numbers.padding) / 2, height / 2);
    } else {
        ctx.fillText(yText, css.title.xPos, css.title.yPos);
    }

    // Draw title
    ctx.font = title.weight + " " + titleSize + " " + title.font;
    ctx.fillStyle = title.colour;
    if (title.textAlign) {
        ctx.textAlign = title.textAlign as CanvasTextAlign;
        ctx.fillText(titleText, titleAlign, padding.top / 2);
    } else {
        ctx.fillText(titleText, title.xPos, title.yPos);
    }
}

function addCoordToPoint(p: Point, x: number, y: number, width: number, height: number): void {
    p.coords.x1 = x;
    p.coords.x2 = x + width;
    p.coords.y1 = y;
    p.coords.y2 = y + height;
}

/** Draws data points and connecting lines for the current line being passed in */
function drawLine(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    points: Point[],
    padding: IPadding,
    currSeries: ILine,
    xTicks: number,
    xMax: number,
    yMax: number,
    hasBars: boolean,
): void {
    const numPoints = points.length;
    const pointCenter = currSeries.css.points.size / 2;
    const xGap = hasBars
        ? (width - padding.left - padding.right) / (xMax + xMax / xTicks)
        : (width - padding.left - padding.right) / xMax; // Pixels per 1 unit in relation to the x-axis
    const yGap = (height - padding.top - padding.bottom) / yMax; // Pixels per 1 unit in relation to the y-axis
    const xAlign = hasBars ? (xGap * 10) / 2 : 0; // Draws points according to x-axis alignment for bar graphs
    // tslint:disable-next-line:one-variable-per-declaration
    let currX, currY, xMid, yMid, x1Control, x2Control, nextX, nextY; // used for drawing curves

    ctx.fillStyle = currSeries.css.points.colour;
    ctx.strokeStyle = currSeries.css.line.colour;
    ctx.lineWidth = currSeries.css.line.width;

    for (let i = 0; i < numPoints; i++) {
        currX = padding.left + points[i].x * xGap + xAlign;
        currY = height - padding.bottom - points[i].y * yGap;

        if (i !== numPoints - 1) {
            // Prevents index out of range when drawing line
            if (!currSeries.css.line.curved) {
                // Draw stright line connecting dots
                ctx.beginPath();
                ctx.moveTo(currX, currY);
                ctx.lineTo(
                    padding.left + points[i + 1].x * xGap + xAlign,
                    height - padding.bottom - points[i + 1].y * yGap,
                );
                ctx.stroke();
            } else {
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
        ctx.fillRect(
            padding.left + points[i].x * xGap - pointCenter + xAlign,
            height - padding.bottom - points[i].y * yGap - pointCenter,
            currSeries.css.points.size,
            currSeries.css.points.size,
        );
        addCoordToPoint(
            points[i],
            padding.left + points[i].x * xGap - pointCenter + xAlign,
            height - padding.bottom - points[i].y * yGap - pointCenter,
            currSeries.css.points.size,
            currSeries.css.points.size,
        );
    }
}

/** Draws bars for the current bar-variable passed in */
function drawBars(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bars: IBar,
    padding: IPadding,
    numBarSets: number,
    xMax: number,
    yMax: number,
    currBar: number,
): void {
    const numBars = bars.points.length; // number of bars in current data set
    const barCenter = (bars.css.bar.width / 2) * numBarSets;
    const xGap = (width - padding.left - padding.right) / (xMax + 10);
    const yGap = (height - padding.top - padding.bottom) / yMax;
    const xAlign = (xGap * 10) / 2; // to centre x-axis for bar graphs
    const barStart = bars.css.bar.width * currBar;

    ctx.fillStyle = bars.css.bar.colour;

    for (let i = 0; i < numBars; i++) {
        ctx.fillRect(
            padding.left + bars.points[i].x * xGap - barCenter + xAlign + barStart,
            height - padding.bottom - bars.points[i].y * yGap,
            bars.css.bar.width,
            bars.points[i].y * yGap,
        );
        addCoordToPoint(
            bars.points[i],
            padding.left + bars.points[i].x * xGap - barCenter + xAlign + barStart,
            height - padding.bottom - bars.points[i].y * yGap,
            bars.css.bar.width,
            bars.points[i].y * yGap,
        );
    }
}

/**
 * drawGraph: Main function that's called everytime the graph is updated
 * @param {IGraphOptions} options: options for the graph
 * @param {ICss} css: CSS/style settings for the graph
 * @param {Array<ILine | IBar>} lines: array of lines and/or bars for the graph
 */
function drawGraph(
    canvas: HTMLCanvasElement,
    options: IGraphOptions,
    css: ICss,
    dataSet: (ILine | IBar)[],
    accessibilityTableDiv: HTMLElement,
): void {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const totalSetsToDraw = dataSet.length;
    const barSetsToDraw = dataSet.filter(data => "bar" in data.css).length;
    let currBar = 0;
    const hasBars = barSetsToDraw > 0 ? true : false;
    // Apply canvas styles
    ctx.fillStyle = css.canvasCss.background.colour;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = css.canvasCss.border.colour;
    ctx.lineWidth = css.canvasCss.border.width;
    ctx.strokeRect(0, 0, width, height);

    drawTitles(
        ctx,
        width,
        height,
        css.canvasCss.padding,
        css.titleCss,
        css.axisCss,
        options.title,
        options.axisOptions.xAxis.name,
        options.axisOptions.yAxis.name,
    );
    drawGrid(ctx, width, height, css.axisCss, css.canvasCss.padding, options.axisOptions, hasBars);

    for (let i = 0; i < totalSetsToDraw; i++) {
        const series = dataSet[i];
        if (isLine(series)) {
            drawLine(
                ctx,
                width,
                height,
                series.points,
                css.canvasCss.padding,
                series,
                options.axisOptions.xAxis.ticks,
                options.axisOptions.xAxis.range[1],
                options.axisOptions.yAxis.range[1],
                hasBars,
            );
        } else {
            drawBars(
                ctx,
                width,
                height,
                series,
                css.canvasCss.padding,
                barSetsToDraw,
                options.axisOptions.xAxis.range[1],
                options.axisOptions.yAxis.range[1],
                currBar,
            );
        }
        if (!isLine(series)) currBar++;
    }

    setUpEventListeners(canvas, options.events, dataSet);
    // createAccessibilityTable(options, dataSet, accessibilityTableDiv);
}

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ------------------------------ animate class --------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

 let points = [];
 let t = 1;;

 function getWaypoints(line: ILine) {
     let numPoints = line.points.length;
     let vertices = [];
     let waypoints = [];
     for (let i = 0; i < numPoints; i++) {
        vertices.push({ x: line.points[i].x, y: line.points[i].y });
     }
     for (let i = 1; i < numPoints; i++) {
         let pt0 = vertices[i - 1];
         let pt1 = vertices[i];
         let dx = pt1.x - pt0.x;
         let dy = pt1.y - pt0.y;
         for (let j = 0; j < 100; j++) {
             let x = pt0.x + dx * j / 100;
             let y = pt0.y + dy * j / 100;
             waypoints.push({ x: x, y: y });
         }
     }
     return waypoints;
 }

 function animate(currLine: ILine): void {
     ctx.fillStyle = currLine.css.points.colour;
     ctx.strokeStyle = currLine.css.line.colour;
     ctx.lineWidth = currLine.css.line.width;
     animateLine();
 }

 function animateLine(): void {
    if (t < points.length - 1) {
        requestAnimationFrame(animateLine);
    }
    ctx.beginPath();
    ctx.moveTo(points[t-1].x, points[t-1].y / 100);
    ctx.lineTo(points[t].x, points[t].y / 100);
    ctx.stroke();
    t++;
 }


/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ------------------------------ example class --------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

const textStyles: ITextStyles = {
    font: "Georgia",
    weight: "bold",
    size: "0.8rem",
    colour: "#000000",
    rotateYLabel: true,
    xLabelTextAlign: "center",
    yLabelTextAlign: "center",
};

const numberFormatting: INumberStyles = {
    format: function formatNumber(num: number) {
        return (num / 1000).toFixed(0) + "K";
    },
    font: "Arial",
    size: 12,
    padding: 18,
    colour: "black",
};

const axisCss: IAxisCss = {
    axisLineWidth: 2,
    axisLineColour: "#000000",
    gridLineWidth: 0.5,
    gridLineColour: "#000000",
    title: textStyles,
    numbers: numberFormatting,
};

const titleCSS: ITitleCss = {
    font: "Arial",
    weight: "bold",
    size: 20,
    colour: "#000000",
    textAlign: "center",
};

const myPadding: IPadding = {
    left: 85,
    right: 70,
    top: 80,
    bottom: 80,
};

const canvasCSS: ICanvasCss = {
    border: {
        colour: "#0000f0",
        width: 3,
    },
    padding: myPadding,
    background: {
        colour: "#ffffff",
        axis: "#000000",
        values: "#000000",
    },
};

const css: ICss = {
    titleCss: titleCSS,
    canvasCss: canvasCSS,
    axisCss: axisCss,
};

const myEvents: IEvents = {
    hoverOn: function fHoverOn(dataName: string, x: number, y: number, xPos: number, yPos: number) {
        document.getElementById("graphHover").style.visibility = "visible";
        document.getElementById("graphHover").style.top = (yPos - 65).toString() + "px";
        document.getElementById("graphHover").style.left = (xPos - 55).toString() + "px";
        document.getElementById("hover-data-name").innerHTML = dataName;
        document.getElementById("hover-coords").innerHTML =
            "x: " + x.toFixed(1).toString() + ", y: " + y.toFixed(1).toString();
    },
    hoverOff: function fHoverOff() {
        document.getElementById("graphHover").style.visibility = "hidden";
    },
    clickOn: function fClickOn(dataName: string, x: number, y: number) {
        document.getElementById("graphHover").style.visibility = "visible";
        document.getElementById("hover-data-name").innerHTML = dataName;
        document.getElementById("hover-coords").innerHTML =
            "x: " + x.toFixed(1).toString() + ", y: " + y.toFixed(1).toString();
    },
    clickOff: function fClickOff() {
        document.getElementById("graphHover").style.visibility = "hidden";
    },
};

const myAxisOptions: IAxisOptions = {
    xAxis: {
        name: "Years",
        drawGridLines: true,
        range: [0, 100],
        ticks: 10,
        clusterNames: ["yr0", "yr1", "yr2", "yr3", "yr4", "yr5", "yr6", "yr7", "yr8", "yr9", "yr10"],
    },
    yAxis: {
        name: "y axis",
        drawGridLines: true,
        range: [0, 100000],
        ticks: 10,
    },
};

const options: IGraphOptions = {
    title: "testGraph",
    autoResize: false,
    axisOptions: myAxisOptions,
    pixelRatio: 1,
    events: myEvents,
};

const testPoints3: Point[] = [
    new Point(0, 32000),
    new Point(10, 24000),
    new Point(20, 27000),
    new Point(30, 18000),
    new Point(40, 42000),
    new Point(50, 50000),
    new Point(60, 83000),
    new Point(70, 66000),
    new Point(80, 73000),
    new Point(90, 52000),
    new Point(100, 90006),
];

const testDataSet: (IBar | ILine)[] = [
    {
        points: testPoints3,
        css: {
            name: "Indigo data",
            line: {
                width: 4,
                colour: "#6e0bca",
                curved: false,
            },
            points: {
                colour: "#6e0bca",
                size: 10,
            },
        },
    },
];

/**
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * ------------------------------ function class -------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const accessibilityTableDiv = document.getElementById("accessibility-table");

drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);

function generateSeriesColour(series: ILine | IBar): void {
    let r = Math.round(Math.random() * 225);
    let g = Math.round(Math.random() * 225);
    let b = Math.round(Math.random() * 225);
    if (isLine(series)) {
        series.css.line.colour = `rgb(${r}, ${g}, ${b})`;
        series.css.points.colour = `rgb(${r}, ${g}, ${b})`;
    } else {
        series.css.bar.colour = `rgb(${r}, ${g}, ${b})`;
    }
}

function generateSeriesPoints(numPoints: number): Point[] {
    let newSet: Point[] = [];

    for (let i = 0; i < numPoints; i++) {
        newSet.push(new Point(i * 10, Number((Math.random() * 100000).toFixed(2))));
    }

    return newSet;
}

document.getElementById("random-btn").addEventListener("click", function() {
    // drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
});

document.getElementById("add-line-btn").addEventListener("click", function() {
    const numDataSet = testDataSet.length;
    let numPoints = testDataSet.length > 0 ? testDataSet[0].points.length : 10;
    let newPoints = [];
    const newCss = {
        name: "New data set " + (numDataSet + 1),
        line: {
            width: 4,
            colour: "black",
            curved: false,
        },
        points: {
            colour: "black",
            size: 10,
        },
    };

    for (let i = 0; i < numPoints; i++) {
        newPoints.push(new Point(i * 10, Number((Math.random() * 100000).toFixed(2))));
    }

    testDataSet.push({ points: newPoints, css: newCss });
    generateSeriesColour(testDataSet[numDataSet]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
    points = getWaypoints({ points: newPoints, css: newCss });
    animate({ points: newPoints, css: newCss });
});

document.getElementById("remove-line-btn").addEventListener("click", function() {
    if (testDataSet.length > 0) {
        testDataSet.pop();
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
    }
});

document.getElementById("animate-btn").addEventListener("click", function() {
    console.log("animating graph...");
    // animate();
});