import {
    drawGraph,
    IAxisCss,
    IAxisOptions,
    IBar,
    ICanvasCss,
    ICss,
    IEvents,
    IGraphOptions,
    ILine,
    IPadding,
    ITitleCss,
    Point,
    ITextStyles,
    INumberStyles,
} from "./graph";

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

const testPoints1: Point[] = [
    new Point(0, 5000),
    new Point(10, 20000),
    new Point(20, 40000),
    new Point(30, 50000),
    new Point(40, 30000),
    new Point(50, 30000),
    new Point(60, 40000),
    new Point(70, 70000),
    new Point(80, 60000),
    new Point(90, 80000),
    new Point(100, 90000),
];
const testPoints2: Point[] = [
    new Point(0, 10000),
    new Point(10, 40000),
    new Point(20, 15000),
    new Point(30, 60000),
    new Point(40, 50000),
    new Point(50, 60000),
    new Point(60, 70000),
    new Point(70, 50000),
    new Point(80, 90000),
    new Point(90, 80000),
    new Point(100, 100000),
];
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
const testPoints4: Point[] = [
    new Point(0, 42000),
    new Point(10, 50000),
    new Point(20, 75000),
    new Point(30, 96000),
    new Point(40, 70000),
    new Point(50, 77000),
    new Point(60, 26000),
    new Point(70, 88000),
    new Point(80, 100000),
    new Point(90, 60000),
    new Point(100, 72000),
];

const testDataSet: (IBar | ILine)[] = [
    {
        points: testPoints1,
        css: {
            name: "Lavender data",
            bar: {
                width: 15,
                colour: "#8e8cff",
            },
        },
    },
    {
        points: testPoints2,
        css: {
            name: "Blue data",
            bar: {
                width: 15,
                colour: "#92efff",
            },
        },
    },
    {
        points: testPoints3,
        css: {
            name: "Indigo data",
            line: {
                width: 2,
                colour: "#6e0bca",
                curved: true,
            },
            points: {
                colour: "#6e0bca",
                size: 8,
            },
        },
    },
    {
        points: testPoints4,
        css: {
            name: "Orange data",
            line: {
                width: 2.5,
                colour: "#ff5e00",
                curved: true,
            },
            points: {
                colour: "#ff5e00",
                size: 8,
            },
        },
    },
];

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const accessibilityTableDiv = document.getElementById("accessibility-table");

function isLine(obj: ILine | IBar): obj is ILine {
    return "line" in obj.css;
}

// function generateSeriesColour(series: ILine | IBar): void {
//     let r = Math.round(Math.random() * 225);
//     let g = Math.round(Math.random() * 225);
//     let b = Math.round(Math.random() * 225);
//     if (isLine(series)) {
//         series.css.line.colour = `rgb(${r}, ${g}, ${b})`;
//         series.css.points.colour = `rgb(${r}, ${g}, ${b})`;
//     } else {
//         series.css.bar.colour = `rgb(${r}, ${g}, ${b})`;
//     }
// }

// function generateSeriesPoints(numPoints: number): Point[] {
//     let newSet: Point[] = [];

//     for (let i = 0; i < numPoints; i++) {
//         newSet.push(new Point(i * 10, Number((Math.random() * 100000).toFixed(2))));
//     }

//     return newSet;
// }

// document.getElementById("randomize-btn").addEventListener("click", () => {
//     const ctx = canvas.getContext("2d");
//     const numDataSet = testDataSet.length;
//     let numPoints;

//     // Generate next set of random points
//     for (let i = 0; i < numDataSet; i++) {
//         numPoints = testDataSet[i].points.length;
//         let series = testDataSet[i];
//         generateSeriesColour(series);

//         for (let j = 0; j < numPoints; j++) {
//             testDataSet[i].points[j].y = Number((Math.random() * 100000).toFixed(2));
//         }
//     }

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // remove accessibility table
//     const removeTable = document.getElementById(options.title + "-table-content");
//     const tableParent = removeTable.parentElement;
//     tableParent.removeChild(removeTable);
//     drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
// });

// document.getElementById("add-bar-btn").addEventListener("click", () => {
//     const ctx = canvas.getContext("2d");
//     const numDataSet = testDataSet.length;
//     let numPoints = testDataSet.length > 0 ? testDataSet[0].points.length : 10;
//     let newPoints = [];
//     const newCss = {
//         name: "New data set " + (numDataSet + 1),
//         bar: {
//             width: 15,
//             colour: "black",
//         },
//     };

//     for (let i = 0; i < numPoints; i++) {
//         newPoints.push(new Point(i * 10, Number((Math.random() * 100000).toFixed(2))));
//     }

//     testDataSet.push({ points: newPoints, css: newCss });
//     generateSeriesColour(testDataSet[numDataSet]);

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // remove accessibility table
//     const removeTable = document.getElementById(options.title + "-table-content");
//     const tableParent = removeTable.parentElement;
//     tableParent.removeChild(removeTable);
//     drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
// });

// document.getElementById("add-line-btn").addEventListener("click", () => {
//     const ctx = canvas.getContext("2d");
//     const numDataSet = testDataSet.length;
//     let numPoints = testDataSet.length > 0 ? testDataSet[0].points.length : 10;
//     let newPoints = [];
//     const newCss = {
//         name: "New data set " + (numDataSet + 1),
//         line: {
//             width: 2,
//             colour: "black",
//             curved: true,
//         },
//         points: {
//             colour: "black",
//             size: 8,
//         },
//     };

//     for (let i = 0; i < numPoints; i++) {
//         newPoints.push(new Point(i * 10, Number((Math.random() * 100000).toFixed(2))));
//     } // 100000 or 500

//     testDataSet.push({ points: newPoints, css: newCss });
//     generateSeriesColour(testDataSet[numDataSet]);

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // remove accessibility table
//     const removeTable = document.getElementById(options.title + "-table-content");
//     const tableParent = removeTable.parentElement;
//     tableParent.removeChild(removeTable);
//     drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
// });

// document.getElementById("remove-btn").addEventListener("click", () => {
//     if (testDataSet.length > 0) {
//         testDataSet.pop();
//         canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
//         // remove accessibility table
//         const removeTable = document.getElementById(options.title + "-table-content");
//         const tableParent = removeTable.parentElement;
//         tableParent.removeChild(removeTable);
//         drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
//     }
// });

// document.getElementById("animate-btn").addEventListener("click", () => {
//     const numDataSet = testDataSet.length;
//     let newSet: (IBar | ILine)[] = [];
//     for (let i = 0; i < numDataSet; i++) {
//         if (isLine(testDataSet[i])) {
//             newSet.push({
//                 points: generateSeriesPoints(testDataSet[i].points.length),
//                 css: {
//                     name: "Indigo data",
//                     line: {
//                         width: 2,
//                         colour: "#6e0bca",
//                         curved: true,
//                     },
//                     points: {
//                         colour: "#6e0bca",
//                         size: 8,
//                     },
//                 },
//             });
//         } else {
//             newSet.push({
//                 points: generateSeriesPoints(testDataSet[i].points.length),
//                 css: {
//                     name: "Lavender data",
//                     bar: {
//                         width: 15,
//                         colour: "#8e8cff",
//                     },
//                 },
//             });
//         }
//     }

//     const updateGraph = createGraphAnimator({
//         animSpeed: 500,
//     });
//     updateGraph(options, css, testDataSet, newSet);

//     // remove accessibility table
//     // const removeTable = document.getElementById(options.title + "-table-content");
//     // const tableParent = removeTable.parentElement;
//     // tableParent.removeChild(removeTable);
//     // drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
// });

// document.getElementById("submit-btn").addEventListener("click", () => {
//     css.canvasCss.padding.top = Number((document.getElementById("top-padding-change") as HTMLInputElement).value);
//     css.canvasCss.padding.bottom = Number((document.getElementById("bottom-padding-change") as HTMLInputElement).value);
//     css.canvasCss.padding.left = Number((document.getElementById("left-padding-change") as HTMLInputElement).value);
//     css.canvasCss.padding.right = Number((document.getElementById("right-padding-change") as HTMLInputElement).value);

//     if ((document.getElementById("title-align-left") as HTMLInputElement).checked) {
//         css.titleCss.textAlign = "left";
//     } else if ((document.getElementById("title-align-center") as HTMLInputElement).checked) {
//         css.titleCss.textAlign = "center";
//     } else {
//         css.titleCss.textAlign = "right";
//     }

//     if ((document.getElementById("x-align-left") as HTMLInputElement).checked) {
//         css.axisCss.title.xLabelTextAlign = "left";
//     } else if ((document.getElementById("x-align-center") as HTMLInputElement).checked) {
//         css.axisCss.title.xLabelTextAlign = "center";
//     } else {
//         css.axisCss.title.xLabelTextAlign = "right";
//     }

//     if ((document.getElementById("y-align-left") as HTMLInputElement).checked) {
//         css.axisCss.title.yLabelTextAlign = "left";
//     } else if ((document.getElementById("y-align-center") as HTMLInputElement).checked) {
//         css.axisCss.title.yLabelTextAlign = "center";
//     } else {
//         css.axisCss.title.yLabelTextAlign = "right";
//     }

//     css.canvasCss.border.width = Number((document.getElementById("border-width") as HTMLInputElement).value);
//     css.canvasCss.border.colour = (document.getElementById("border-colour") as HTMLInputElement).value;
//     drawGraph(canvas, options, css, testDataSet, accessibilityTableDiv);
// });
