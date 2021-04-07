import './App.css';
import React from 'react';

let socket = {};
let loadValues = [];
let currentDataArray = [];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      averageValue: 0,
      standardDeviationValue: 0,
      calculationModeValue: 0,

    }
    this.startLink = this.startLink.bind(this);
    this.startStatistics = this.startStatistics.bind(this);
    this.averageCalculation = this.averageCalculation.bind(this);
    this.standardDeviation = this.standardDeviation.bind(this);
    this.calculationMod = this.calculationMod.bind(this)
  }

  startLink() {
    socket = new WebSocket("wss://trade.trademux.net:8800/?password=1234");
    socket.onmessage = ({data}) => {
      data = JSON.parse(data);
      loadValues.push(data);
    }
  }

  startStatistics() {
    currentDataArray = loadValues;
    this.averageCalculation();
    this.standardDeviation();
    this.calculationMod()
  }

  averageCalculation() {
    let sum = 0;
    let count = currentDataArray.length;
    for (let i = 0; i < count; i++) {
      sum += currentDataArray[i].value;
    }
    let result = sum / count
    this.setState({averageValue: result});
    console.log('averageCalculation averageValue', this.state.averageValue)
  }

  standardDeviation() {
    let average = this.state.averageValue;
    console.log('standardDeviation average', average)
    let sum = 0;
    let count = currentDataArray.length;
    console.log('count', count)
    for (let i = 0; i < count; i++) {
      let difference = currentDataArray[i].value - average;
      let newItem = Math.pow(difference, 2);
      console.log('newItem',newItem)
      sum += newItem;
    }
    let s = sum / (currentDataArray.length - 1);
    let result = Math.sqrt(s)
    this.setState({standardDeviationValue: result});
  }

  calculationMod() {
    // let  currentDataArrayValue =  currentDataArray.value;
    console.log('currentDataArray', currentDataArray)
    let count = currentDataArray.length;
    let newArrayCoincidences = {};

    for (let i = 0; i < count; i++) {
      let currentItemValue = currentDataArray[i].value;
      // console.log('currentItemValue',currentItemValue)
      if (newArrayCoincidences[currentItemValue] === undefined) {
        newArrayCoincidences[currentItemValue] = 1;
      } else {
        newArrayCoincidences[currentItemValue] = newArrayCoincidences[currentItemValue] + 1;
      }
    }
    let parsedKeys = Object.keys(newArrayCoincidences).map(x => parseInt(x));
    let sortedKeys = parsedKeys.sort(function(a, b) {
      return b - a;
    });
    console.log('sortedKeys', sortedKeys)
    let result = sortedKeys.slice(0, 10);
    console.log('result', result)
    this.setState({calculationModeValue: result[0]})
  }


  render() {
    return (
      <div className={'app'}>
        <div className={'header'}>
          <h2>Веб-приложение,которое считает статистические параметры по котировкам с биржи.</h2>
        </div>
        <div className={'button-group'}>
          <button className={'button'} onClick={this.startLink}>
            <span className={'text-button'}>Старт</span>
          </button>
        </div>
        <div className={'button-group'}>
          <button className={'button'} onClick={this.startStatistics}>
            <span className={'text-button'}>Статистика</span>
          </button>
        </div>

        <div className={'average-value'}>
          <span>Средне статистическое значение</span>
          <div>{this.state.averageValue}</div>
        </div>
        <div className={'standard-deviation-value'}>
          <span>Стандартное отклонение</span>
          <div>{this.state.standardDeviationValue}</div>
        </div>
        <div className={'standard-deviation-value'}>
          <span>Стандартное отклонение</span>
          <div>{this.state.calculationModeValue}</div>
        </div>

      </div>
    );
  }

}

export default App;
