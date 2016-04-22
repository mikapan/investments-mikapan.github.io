var particleSystem = [];
var investorSystem = [];
var attractors = [];
var table;
var aggregated = {};
var connections = [];
var investors = [];
var table2;
var companiesToDisplay = [];
var investorsToDisplay = [];
var investorsParticles = [];
var investorsAggregated = [];
var button;

function preload() {
    table = loadTable("data/investments.csv", "csv", "header");
    table2 = loadTable("data/companies_categories.csv", "csv", "header");
}


function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    frameRate(30);

    button = createButton('back');
    button.position(width / 2 - 30, height / 2 + 300);
    button.mousePressed(goBack);

    colorMode(HSB, 360, 100, 100, 100);
    textAlign(CENTER);

    /* aggregates usd amounts per company invested by using the object aggregated  */
    for (var r = 0; r < table.getRowCount(); r++) {
        var cname = table.getString(r, "company_name");
        var invested = table.getString(r, "amount_usd");
        var investorname = table.getString(r, "investor_name")
        invested = parseInt(invested);
        if (!isNaN(invested)) {
            if (aggregated.hasOwnProperty(cname)) {
                aggregated[cname] = aggregated[cname] + invested;
            } else {
                aggregated[cname] = invested;
            }

            //add amount of investor 
            if (investorsAggregated.hasOwnProperty(investorname)) {
                investorsAggregated[investorname] = investorsAggregated[investorname] + invested;
            } else {
                investorsAggregated[investorname] = invested;
            }
            //end for adding amount  

        }
        investorsAggregated[investorname] = "";
    }



    /* converts the object into an array of companies */
    var aAggregated = [];
    Object.keys(aggregated).forEach(function (name_) {
        var company = {};
        company.name = name_;
        company.sum = aggregated[name_]
        aAggregated.push(company);
    });


    /* sorts the array by usd amount */
    aAggregated.sort(function (companyA, companyB) {
        return companyB.sum - companyA.sum;
    });

    aAggregated = aAggregated.slice(0, 100);

    var investors = [];
    Object.keys(investorsAggregated).forEach(function (name) {
        var investor = {};
        investor.name = name;
        investors.push(investor);
    });

    //create an investorParticle per each investor, put the investor inside the particle and the particle inside the investors
    investors.forEach(function (iv) {
        var particle = new investorParticle(iv.name, 12, iv);
        iv.particle = particle;
        investorsParticles.push(particle);
    });

    for (var r = 0; r < table.getRowCount(); r++) {
        var cname = table.getString(r, "company_name");
        var invested = table.getString(r, "amount_usd");
        var investorname = table.getString(r, "investor_name")
        invested = parseInt(invested);

        var foundCompany = aAggregated.find(function (element) {
            return element.name == cname;
        });

        if (foundCompany) {

            var foundInvestor = investors.find(function (element) {
                return element.name == investorname;
            });

            if (foundInvestor) {

                var connection = {};
                connection.company = foundCompany;
                connection.investor = foundInvestor;
                connection.amount = invested;
                connections.push(connection);

            }

        }

    }

    /* creates 100 particles from the array */
    for (var i = 0; i < aAggregated.length; i++) {
        var p = new Particle(aAggregated[i].name, aAggregated[i].sum);
        particleSystem.push(p);
        companiesToDisplay.push(p)
            //print(p);
    }


    /* COUNT THE NUMBER OF CATEGORIES */
    var ob = {}; //this is the counts
    for (var i = 0; i < table2.getRowCount(); i++) {
        var catName = table2.getString(i, "category_code");
        if (ob.hasOwnProperty(catName)) {
            ob[catName]++;
        } else {
            ob[catName] = 1;
        }
    };


    /* creates a central atractor of strength 1 */
    var at = new Attractor(createVector(width / 2, height / 2), 1);
    attractors.push(at);

}


function draw() {
    background(10);

    /*checks for pairs of particles*/
    for (var STEPS = 0; STEPS < 4; STEPS++) {
        for (var i = 0; i < particleSystem.length - 1; i++) {
            for (var j = i + 1; j < particleSystem.length; j++) {
                var pa = particleSystem[i];
                var pb = particleSystem[j];
                var ab = p5.Vector.sub(pb.pos, pa.pos);
                var distSq = ab.magSq();
                if (distSq <= sq(pa.radius + pb.radius)) {
                    var dist = sqrt(distSq);
                    var overlap = (pa.radius + pb.radius) - dist;
                    ab.div(dist); //ab.normalize();
                    ab.mult(overlap * 0.5);
                    pb.pos.add(ab);
                    ab.mult(-1);
                    pa.pos.add(ab);

                    pa.vel.mult(0.97);
                    pb.vel.mult(0.97);

                }
            }
        }
    }



    for (var i = companiesToDisplay.length - 1; i >= 0; i--) {
        var p = companiesToDisplay[i];
        p.update();
        p.draw();
    }


    investorsToDisplay.forEach(function (investorParticle) {
        investorParticle.update();
        investorParticle.draw();
    });

    drawLegend();
}

/*COMPANY PARTICLES HERE*/
var Particle = function (name, sum, category) {
    this.name = name;
    this.sum = sum;
    this.category = category

    this.radius = sqrt(sum) / 4000;
    var initialRadius = this.radius;

    var isMouseOver = false;
    var maximumRadius = 70;

    var tempAng = random(TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    this.pos.div(this.radius);
    this.pos.mult(1000);
    this.pos.set(this.pos.x + width / 2, this.pos.y + height / 2);
    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);

    var rowCat = table2.findRow(this.name, "name");

    if (rowCat != null) {
        this.categoryName = rowCat.get("category_code");
    } else {}

    switch (this.categoryName) {
    case "software":
        this.color = {
            h: 220,
            s: 40,
            b: 80
        };
        break;
    case "web":
        this.color = {
            h: 240,
            s: 40,
            b: 90
        };
        break;
    case "biotech":
        this.color = {
            h: 260,
            s: 30,
            b: 90
        };
        break;
    case "mobile":
        this.color = {
            h: 290,
            s: 30,
            b: 90
        };
        break;
    case "enterprise":
        this.color = {
            h: 320,
            s: 25,
            b: 95
        };
        break;
    case "ecommerce":
        this.color = {
            h: 350,
            s: 20,
            b: 96
        };
        break;
    default:
        this.color = {
            h: 221,
            s: 23,
            b: 190
        };
    }

    this.update = function () {
        checkMouse(this);

        attractors.forEach(function (A) {
            var att = p5.Vector.sub(A.pos, this.pos);
            var distanceSq = att.magSq();
            if (distanceSq > 1) {
                att.normalize();
                att.div(10);
                //att.mult(this.radius*this.radius/200);
                acc.add(att);
            }
        }, this);
        this.vel.add(acc);
        this.pos.add(this.vel);
        acc.mult(0);
    }

    this.draw = function () {
        noStroke();
        if (isMouseOver) {
            fill(0, 100, 50);
        } else {
            fill(0, 0, 50);
        }

        fill(this.color.h, this.color.s, this.color.b);
        ellipse(this.pos.x,
            this.pos.y,
            this.radius * 2,
            this.radius * 2);

        if (this.radius == maximumRadius) {

            fill(this.color.h, this.color.s + 40, this.color.b * 0.8);
            textSize(8);
            text(this.categoryName, this.pos.x, this.pos.y + 35);
            fill(0, 0, 20);
            textFont("Univers");
            textSize(13);
            textStyle(BOLD);
            text(this.name, this.pos.x, this.pos.y - 5);
            textSize(8);
            text('$' + nfc(this.sum), this.pos.x, this.pos.y + 10);

        }
    }

    function checkMouse(instance) {
        var mousePos = createVector(mouseX, mouseY)
        if (mousePos.dist(instance.pos) <= instance.radius) {
            incRadius(instance);
            isMouseOver = true;
        } else {
            decRadius(instance);
            isMouseOver = false;
        }

    }

    function incRadius(instance) {
        instance.radius += 4;
        if (instance.radius > maximumRadius) {
            instance.radius = maximumRadius;
        }

    }

    function decRadius(instance) {
        instance.radius -= 4;
        if (instance.radius < initialRadius) {
            instance.radius = initialRadius;
        }
    }

    this.getMouseOver = function () {
        return isMouseOver;
    }
}

/*INVESTOR PARTICLES HERE*/
var investorParticle = function (name, sum, investor) {
    this.invename = name;
    this.totalinvested = sum;
    this.radius = 10;
    this.investor = investor;

    this.pos = createVector(random(0, width), random(0, height));

    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);
    var isMouseOver = false;



    this.update = function () {

        this.radius = sqrt(this.amount / 5000000)
            //make investors move clockwise
        var center = createVector(width / 2, height / 2)

        var v = p5.Vector.sub(this.pos, center);
        v.rotate(HALF_PI);
        v.normalize();
        v.mult(2); //speed

        this.pos.add(v);

    }


    this.draw = function () {

        fill(286, 23, 64)
        ellipse(this.pos.x, this.pos.y, this.radius * 3, this.radius * 3);
        fill(0, 0, 100);

        push();
        translate(this.pos.x, this.pos.y);
        scale(0.8);
        text(this.invename, 0, 0 + 20);
        text('$' + nfc(this.amount), 0, 0 + 40);
        pop();
    }


    //to make investors' circles distribute around the company
    var tempAng = random(TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    this.pos.div(this.radius);
    this.pos.mult(2500);
    this.pos.set(this.pos.x + width / 2, this.pos.y + height / 2);
    this.vel = createVector(0, 0);
    var acc = createVector(0, 0);
}




function mouseClicked() {
    var clickedCompany = null;

    companiesToDisplay.forEach(function (co) {

        if (co.getMouseOver()) clickedCompany = co;
    });


    if (clickedCompany != null) {
        companiesToDisplay = [];
        companiesToDisplay.push(clickedCompany)
    }

    investorsToDisplay = [];
    connections.forEach(function (c) {
        if (clickedCompany != null) {
            if (c.company.name == clickedCompany.name) {
                if (!investorsToDisplay.includes(c.investor.particle)) {
                    investorsToDisplay.push(c.investor.particle);

                    c.investor.particle.amount = c.amount;
                } else {
                    c.investor.particle.amount += c.amount
                }

            }
        }

    });
    console.log(investorsToDisplay);
    var ang = 0;
    investorsToDisplay.forEach(function (p) {
        p.pos.x = width / 2 + cos(ang) * 280;
        p.pos.y = height / 2 + sin(ang) * 280;
        ang += TWO_PI / investorsToDisplay.length;
    });
}

function goBack() {
    companiesToDisplay = [];
    particleSystem.forEach(function (p) {
        companiesToDisplay.push(p);
    })
}



var Attractor = function (pos_, s) {
    this.pos = pos_.copy();
    var strength = s;
    this.draw = function () {
        noStroke();
        fill(0, 100, 100);
        ellipse(this.pos.x, this.pos.y,
            strength, strength);
    }
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

}

//draw the reference for locations

function drawLegend() {
    var arr = [

        {
            text: 'Visualization of Investments',
            color: '#9b7ea4'
        },

    ];

    noStroke();
    textSize(34);

    textFont("Univers");
    textStyle(BOLD);
    textAlign(LEFT);
    arr.forEach(function (e) {
        fill(e.color);
        text(e.text, 45, 60);
    });

    var arr1 = [

        {
            text: "As a economic entity in the market, enterprises must maximize their own profits in the business. Thus, they can survive and develop. Basically, investment is the fundamental source of profits in the company, through operate investment to achieve the investment objective. Therefore, a good investment decision is a very important process to a company’s development.",
            color: '#c6b8c3'
        },

    ];

    textSize(10);
    arr1.forEach(function (e) {
        fill(e.color);
        text(e.text, 50, 100, 250, 300);
    });

    var arr2 = [

        {
            text: "CrunchBase provides information about companies, products, people, investors and the activities that connect them. In this visualization, the main page display the top 100 companies from the data source. Company name and total gained investment are display in each particle and color coded by category. By clicking each particle, the investors for the selected company are shown on the page and orbiting around the company particle. The scale of particle are proportional to the amount of investment. ",
            color: '#c6b8c3'
        },

    ];

    textSize(10);
    arr2.forEach(function (e) {
        fill(e.color);
        text(e.text, 50, 250, 250, 300);
    });

    var arr3 = [
        {
            text: 'http://1drv.ms/1nmR0Vv',
            color: '#a28b9c'
        },
    ];
    textSize(8);
    textStyle(BOLD);
    arr3.forEach(function (e) {
        fill(e.color);
        text(e.text, 50, 400, 200, 400);
    });

    var arr4 = [
        {
            text: 'NEU Spring2016 | Mika Pan',
            color: '#a28b9c'
        },
    ];
    textSize(8);
    textStyle(BOLD);
    arr4.forEach(function (e) {
        fill(e.color);
        text(e.text, 50, 420, 220, 400);
    });

    //category
    var arr5 = [
        {
            text: 'Web',
            color: '#8a8ae6'
        },
        {
            text: 'Mobile',
            color: '#daa1e5'
        },

        {
            text: 'Software',
            color: '#7a96cc'
        },


        {
            text: 'Biotech',
            color: '#b8a1e5'
        },

        {
            text: 'Enterprise',
            color: '#f2b6de'
        },
        {
            text: 'Ecommerce',
            color: '#f5c4cc'
        },
        {
            text: 'Others',
            color: '#c4d7ff'
        },
    ];
    arr5.forEach(function (e, i) {

        textSize(12);
        fill(e.color);
        noStroke();
        ellipse(width / 6 * 5, 110 + i * 17, 10, 10);
        text(e.text, width / 6 * 5 + 20, 115 + i * 17);
    });
}
//draw the location end