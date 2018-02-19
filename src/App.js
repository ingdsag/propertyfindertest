//USING https://github.com/andrewhayward/dijkstra Andrew's Dijkstra Algorithm, Many thanks Andrew.

import React, {Component} from 'react';
import './App.css';
import {Dimmer, Loader, Segment, Dropdown, Button, Grid, Header} from 'semantic-ui-react';
const Graph = (function (undefined) {

    var extractKeys = function (obj) {
        var keys = [], key;
        for (key in obj) {
            Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
        }
        return keys;
    }

    var sorter = function (a, b) {
        return parseFloat (a) - parseFloat (b);
    }

    var findPaths = function (map, start, end, infinity) {
        infinity = infinity || Infinity;

        var costs = {},
            open = {'0': [start]},
            predecessors = {},
            keys;

        var addToOpen = function (cost, vertex) {
            var key = "" + cost;
            if (!open[key]) open[key] = [];
            open[key].push(vertex);
        }

        costs[start] = 0;

        while (open) {
            if(!(keys = extractKeys(open)).length) break;

            keys.sort(sorter);

            var key = keys[0],
                bucket = open[key],
                node = bucket.shift(),
                currentCost = parseFloat(key),
                adjacentNodes = map[node] || {};

            if (!bucket.length) delete open[key];

            for (var vertex in adjacentNodes) {
                if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
                    var cost = adjacentNodes[vertex],
                        totalCost = cost + currentCost,
                        vertexCost = costs[vertex];

                    if ((vertexCost === undefined) || (vertexCost > totalCost)) {
                        costs[vertex] = totalCost;
                        addToOpen(totalCost, vertex);
                        predecessors[vertex] = node;
                    }
                }
            }
        }

        if (costs[end] === undefined) {
            return null;
        } else {
            return predecessors;
        }

    }

    var extractShortest = function (predecessors, end) {
        var nodes = [],
            u = end;

        while (u !== undefined) {
            nodes.push(u);
            u = predecessors[u];
        }

        nodes.reverse();
        return nodes;
    }

    var findShortestPath = function (map, nodes) {
        var start = nodes.shift(),
            end,
            predecessors,
            path = [],
            shortest;

        while (nodes.length) {
            end = nodes.shift();
            predecessors = findPaths(map, start, end);

            if (predecessors) {
                shortest = extractShortest(predecessors, end);
                if (nodes.length) {
                    path.push.apply(path, shortest.slice(0, -1));
                } else {
                    return path.concat(shortest);
                }
            } else {
                return null;
            }

            start = end;
        }
    }

    var toArray = function (list, offset) {
        try {
            return Array.prototype.slice.call(list, offset);
        } catch (e) {
            var a = [];
            for (var i = offset || 0, l = list.length; i < l; ++i) {
                a.push(list[i]);
            }
            return a;
        }
    }

    var Graph = function (map) {
        this.map = map;
    }

    Graph.prototype.findShortestPath = function (start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(this.map, start);
        } else if (arguments.length === 2) {
            return findShortestPath(this.map, [start, end]);
        } else {
            return findShortestPath(this.map, toArray(arguments));
        }
    }

    Graph.findShortestPath = function (map, start, end) {
        if (Object.prototype.toString.call(start) === '[object Array]') {
            return findShortestPath(map, start);
        } else if (arguments.length === 3) {
            return findShortestPath(map, [start, end]);
        } else {
            return findShortestPath(map, toArray(arguments, 1));
        }
    }

    return Graph;

})();
const renderLoader = () => (
    <Segment>
        <Dimmer active>
            <Loader/>
        </Dimmer>
    </Segment>
);

const buildForDropdownComponent = (cities) => {
    return cities.map((city) => {
        return {
            key: city,
            value: city,
            text: city
        }
    });
};
let fastestRoutes = [];
let nodeCostFastestRoutes = [];
let cheapestRoutes = [];
let nodeCostCheapestRoutes = [];
const convertToMinutes = (hours, minutes) => {
    return parseInt(hours) * 60 + parseInt(minutes);
};
const compareTime = (storedDeal, compareDeal) => {
    const storedDealTime = convertToMinutes(storedDeal.duration.h, storedDeal.duration.m);
    const compareDealTime = convertToMinutes(compareDeal.duration.h, compareDeal.duration.m);
    return compareDealTime < storedDealTime;
};

const getRealPrice = (cost, discount) => {
    return cost - cost * discount/100;
};

const comparePrice = (storedDeal, compareDeal) => {
    const storedDealPrice = getRealPrice(storedDeal.cost, storedDeal.discount);
    const compareDealPrice = getRealPrice(compareDeal.cost, compareDeal.discount);
    return compareDealPrice < storedDealPrice;
};
const getNodeCostFastestRoutes = () => {
    const preliminaryObject = {};
    fastestRoutes.forEach((fastest) => {
        if (!preliminaryObject[fastest.departure]) {
            preliminaryObject[fastest.departure] = {};
        }
        preliminaryObject[fastest.departure][fastest.arrival] = convertToMinutes(fastest.duration.h, fastest.duration.h)
    });
    return preliminaryObject;
};
const getNodeCostCheapestRoutes = () => {
    const preliminaryObject = {};
    cheapestRoutes.forEach((cheapest) => {
        if (!preliminaryObject[cheapest.departure]) {
            preliminaryObject[cheapest.departure] = {};
        }
        preliminaryObject[cheapest.departure][cheapest.arrival] = getRealPrice(cheapest.cost, cheapest.discount);
    });
    return preliminaryObject;
};
const getFastestRoutes = (model) => {
    const preliminaryArray = [];
    const resultArray = [];
    model.forEach((deal) => {
        if (!preliminaryArray[`${deal.departure}-${deal.arrival}`] || compareTime(preliminaryArray[`${deal.departure}-${deal.arrival}`], deal)) {
            preliminaryArray[`${deal.departure}-${deal.arrival}`] = deal;
        }
    });
    for (let item in preliminaryArray) {
        resultArray.push(preliminaryArray[item])
    }
    return resultArray;
};
const getCheapestRoutes = (model) => {
    const preliminaryArray = [];
    const resultArray = [];
    model.forEach((deal) => {
        if (!preliminaryArray[`${deal.departure}-${deal.arrival}`] || comparePrice(preliminaryArray[`${deal.departure}-${deal.arrival}`], deal)) {
            preliminaryArray[`${deal.departure}-${deal.arrival}`] = deal;
        }
    });
    for (let item in preliminaryArray) {
        resultArray.push(preliminaryArray[item])
    }
    return resultArray;
};
const getComplexRoute = (originCity, destinationCity, model, criteria) => {
    let map;
    if (criteria === 'cheapest') {
        map = nodeCostCheapestRoutes;
    } else {
        map = nodeCostFastestRoutes
    }
    const graph = new Graph(map);
    const parsedRoute = [];
    const shortestRoute = graph.findShortestPath(originCity, destinationCity);
    shortestRoute && shortestRoute.forEach((shortest, index) => {
        if (criteria === 'cheapest') {
            cheapestRoutes.forEach((cheapest) => {
                if (shortestRoute[index + 1] && shortest === cheapest.departure && shortestRoute[index + 1] === cheapest.arrival) {
                    parsedRoute.push(cheapest);
                }
            })
        } else {
            fastestRoutes.forEach((fastest) => {
                if (shortestRoute[index + 1] && shortest === fastest.departure && shortestRoute[index + 1] === fastest.arrival) {
                    parsedRoute.push(fastest);
                }
            })
        }
    });
    return parsedRoute;
};

class App extends Component {

    resultModel;

    componentWillMount() {
        this.setState({
            cityOptions: [],
            originCity: '',
            destinationCity: '',
            searchCriteria: 'cheapest',
            route: [],
            resetClicked: false
        });
        this.resetClicked = this.resetClicked.bind(this);
        this.setCheapest = this.setCheapest.bind(this);
        this.setFastest = this.setFastest.bind(this);
        this.originChanged = this.originChanged.bind(this);
        this.destinationChanged = this.destinationChanged.bind(this);
    }

    computeDestination(prevState) {
        const {originCity, destinationCity, searchCriteria, resetClicked} = this.state;

        if ((prevState.originCity !== originCity || prevState.destinationCity !== destinationCity || searchCriteria !== prevState.searchCriteria) && originCity && destinationCity) {
            const route = getComplexRoute(originCity, destinationCity, this.resultModel.deals, searchCriteria, true);
            this.setState({route});
        }
        if (resetClicked) {
            this.setState({resetClicked: false, route: [], originCity: '', destinationCity: ''})
        }

    }

    componentDidUpdate(prevProps, prevState) {
        this.computeDestination(prevState);
    }

    originChanged(e, data) {
        this.setState({originCity: data.value});
    }
    destinationChanged(e, data) {
        this.setState({destinationCity: data.value});
    }

    fetchDeals () {
        fetch('http://www.codehater.com/propertyfinder/response.json').then((response) => {
            return response.json();
        }).then((jsonResult) => {
            this.resultModel = jsonResult;
            fastestRoutes = getFastestRoutes(this.resultModel.deals);
            cheapestRoutes = getCheapestRoutes(this.resultModel.deals);
            nodeCostFastestRoutes = getNodeCostFastestRoutes();
            nodeCostCheapestRoutes = getNodeCostCheapestRoutes();
            this.arrangeSelectableCountries(jsonResult);
        });
    }

    setCheapest() {
        this.setState({searchCriteria: 'cheapest'});
    }

    resetClicked() {
        this.setState({resetClicked: true});
    }

    setFastest() {
        this.setState({searchCriteria: 'fastest'});
    }

    arrangeSelectableCountries(jsonResult) {
        let cityOptions = [];
        jsonResult.deals.forEach((singleDeal) => {
            (cityOptions.indexOf(singleDeal.departure) === -1) && cityOptions.push(singleDeal.departure);
            (cityOptions.indexOf(singleDeal.arrival) === -1) && cityOptions.push(singleDeal.arrival);
        });
        this.setState({
            cityOptions: buildForDropdownComponent(cityOptions.sort())
        });
    }
    renderTotalRoute() {
        const {route} = this.state;
        let sumOfCosts = 0;
        let sumOfTime = 0;
        route.forEach((singleTrip) => {
            const {duration, cost, discount} = singleTrip;
            sumOfCosts += getRealPrice(cost, discount);
            sumOfTime += convertToMinutes(duration.h, duration.m);
        });
        let hours = Math.floor( sumOfTime / 60);
        let minutes = sumOfTime % 60;

        return (
            <div><Grid columns={3}>
                <Grid.Row>
                    <Grid.Column>
                        Total

                    </Grid.Column>
                    <Grid.Column>
                        {hours}h{minutes}
                    </Grid.Column>
                    <Grid.Column>
                        ${sumOfCosts} €
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Button onClick={this.resetClicked}>Reset</Button>
                </Grid.Row>
            </Grid>
        </div>)
    }
    renderRoute() {
        const {route} = this.state;

        return route.map((singleTrip, index) => {
            const {duration, cost, discount, reference, transport, departure, arrival} = singleTrip;
            const realPrice = getRealPrice(cost, discount);
            return <div key={index}>
                    <div className='route'>
                        <Grid columns={3}>
                            <Grid.Row>
                                <Grid.Column>
                                    {`${departure} > ${arrival}`}
                                    <div>
                                        {`${transport} ${reference} for ${duration.h}h${duration.m}`}
                                    </div>
                                </Grid.Column>
                                <Grid.Column/>
                                <Grid.Column>
                                    <span className="cost">{`${realPrice} €`}</span>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                </div>
        })
    }

    renderContent () {
        const {cityOptions, route, searchCriteria, originCity, destinationCity} = this.state;
        return <div>
            <Header as='h1'>Select your travel destination</Header>
            <Dropdown placeholder='From' fluid search selection options={cityOptions} onChange={this.originChanged}/>
            <Dropdown placeholder='To' fluid search selection options={cityOptions} onChange={this.destinationChanged}/>
            {searchCriteria === 'cheapest' ? <div><Button basic color='blue'>Cheapest</Button><Button basic onClick={this.setFastest}>Fastest</Button></div> : <div><Button basic onClick={this.setCheapest}>Cheapest</Button><Button basic color='blue'>Fastest</Button></div>}
            {route.length ? this.renderRoute() : ''}
            {route.length ? this.renderTotalRoute() : ''}
            {route.length === 0 && originCity && destinationCity ? 'Sorry, no routes found for your selected path.' : ''}
        </div>
    }

    render() {
        const {cityOptions} = this.state;


        return (
            <div className="App">
                <Grid columns={12} centered>
                    <Grid.Row>
                        <Grid.Column width={1}/>
                        <Grid.Column width={10}>
                            {!cityOptions.length && this.fetchDeals() && renderLoader()}
                            {!!cityOptions.length && this.renderContent()}
                        </Grid.Column>
                        <Grid.Column width={1}/>
                    </Grid.Row>
                </Grid>
            </div>);
    }
}

export default App;

