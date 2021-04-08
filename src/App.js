import './App.css';
import React from 'react';

let socket = {};
let loadValues = [];
let currentDataArray = [];
let latency = 0;
const oddOrEven = (count) => {
  let res = (count & 1) ? "odd" : "even";
  return res;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      averageValue: 0,
      standardDeviationValue: 0,
      calculationModeValue: 0,
      calculationMedianValue: 0,
      startMoment: Date.now(),
      endMoment: 0,
      value: '',
      timeResponse: 0,
      isResponseFailed: false,
    }
    this.startLink = this.startLink.bind(this);
    this.startStatistics = this.startStatistics.bind(this);
    this.averageCalculation = this.averageCalculation.bind(this);
    this.standardDeviation = this.standardDeviation.bind(this);
    this.calculationMod = this.calculationMod.bind(this);
    this.calculationMedian = this.calculationMedian.bind(this);
    this.visibilityText = this.visibilityText.bind(this);
    this.executePing = this.executePing.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  startLink(event) {
    event.target.classList.add('active-button');
    socket = new WebSocket("wss://trade.trademux.net:8800/?password=1234");

    socket.onmessage = ({data}) => {
      this.setState({endMoment: Date.now()});
      if (latency === 0) {
        latency = this.state.endMoment - this.state.startMoment;
        setTimeout(this.visibilityText, 1);
      }
      data = JSON.parse(data);
      loadValues.push(data);
    }

  }

  visibilityText() {
    let element = document.getElementsByClassName('text-info');
    element[0].classList.add('text-info-visibility')
  }


  startStatistics() {
    currentDataArray = loadValues;
    this.averageCalculation();
    this.standardDeviation();
    this.calculationMod();
    this.calculationMedian();
  }

  averageCalculation() {
    if (currentDataArray.length > 0) {
      let sum = 0;
      let count = currentDataArray.length;
      for (let i = 0; i < count; i++) {
        sum += currentDataArray[i].value;
      }
      let result = sum / count;
      this.setState({averageValue: result});
      return result;
    } else {
      this.setState({averageValue: 'Нет данных'});
    }

  }

  standardDeviation() {
    if (currentDataArray.length > 0) {
      let average = this.averageCalculation();
      let sum = 0;
      let count = currentDataArray.length;
      for (let i = 0; i < count; i++) {
        let difference = currentDataArray[i].value - average;
        let newItem = Math.pow(difference, 2);
        sum += newItem;
      }
      let s = sum / (currentDataArray.length - 1);
      let result = Math.sqrt(s)
      this.setState({standardDeviationValue: result});
    } else {
      this.setState({standardDeviationValue: 'Нет данных'});

    }

  }

  calculationMod() {
    if (currentDataArray.length > 0) {
      let count = currentDataArray.length;
      let newArrayCoincidences = {};

      for (let i = 0; i < count; i++) {
        let currentItemValue = currentDataArray[i].value;
        if (newArrayCoincidences[currentItemValue] === undefined) {
          newArrayCoincidences[currentItemValue] = 1;
        } else {
          newArrayCoincidences[currentItemValue] = newArrayCoincidences[currentItemValue] + 1;
        }
      }

      let list_value = [];
      let result = Object.entries(newArrayCoincidences).sort((a, b) => (b[1] - a[1]));
      result = result.filter(current => {
        if (current[1] === result[0][1]) {
          list_value.push(current[0]);
          return current;
        }
      })
      this.setState({calculationModeValue: list_value[0]})
    } else {
      this.setState({calculationModeValue: 'Нет данных'})

    }

  }

  calculationMedian() {
    if (currentDataArray.length > 0) {
      let sortCurrentDataArray = currentDataArray;
      let result = 0;
      sortCurrentDataArray.sort(function(a, b) {
        if (a.value > b.value) {
          return 1;
        }
        if (a.value < b.value) {
          return -1;
        }
        return 0;
      });
      let count = sortCurrentDataArray.length;
      const isOdOrEven = oddOrEven(count);
      if (isOdOrEven === 'odd') {
        let number = Math.floor(count / 2);
        result = sortCurrentDataArray[number].value;
      } else {
        let number = count / 2;
        result = (sortCurrentDataArray[number - 1].value + sortCurrentDataArray[number].value) / 2;
      }
      this.setState({calculationMedianValue: result});
    } else {
      this.setState({calculationMedianValue: 'Нет данных'});

    }

  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  async executePing() {
    let url = this.state.value;
    console.log('url', url);
    const startMoment = Date.now();
    let endMoment;
    try {
      let response = await fetch(`https://${url}`);
      endMoment = Date.now();
      this.setState({timeResponse: endMoment - startMoment, isResponseFailed: false});
      console.log('executePing', this.state.timeResponse)
    } catch (error) {
      console.log('executePing', 'no response');
      this.setState({timeResponse: 0, isResponseFailed: true});
    }
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
          <div className={'text-info'}>
            <span>Соединение установлено</span>
          </div>
        </div>
        <div className={'button-group'}>
          <button className={'button'} onClick={this.startStatistics}>
            <span className={'text-button'}>Статистика</span>
          </button>
        </div>

        <div className={'div-value average-value'}>
          <span>Средне статистическое значение</span>
          <div>{this.state.averageValue}</div>
        </div>
        <div className={'div-value standard-deviation-value'}>
          <span>Стандартное отклонение</span>
          <div>{this.state.standardDeviationValue}</div>
        </div>
        <div className={' div-value standard-deviation-value'}>
          <span> Мода </span>
          <div>{this.state.calculationModeValue}</div>
        </div>
        <div className={'div-value standard-deviation-value'}>
          <span> Медиана </span>
          <div>{this.state.calculationMedianValue}</div>
        </div>

        <div>
          <h2>Пингователь</h2>
          <div className={'container-address'}>
            <input placeholder={'ВВедите адрес сервера'}
                   className={'input-address'}
                   value={this.state.value}
                   onChange={this.handleChange}/>
          </div>
          <input type="submit" value="Отправить" onClick={this.executePing}/>
          <div>
            Время запроса:
            {this.state.isResponseFailed ? 'Запрос недостиг сервера' : ' ' + this.state.timeResponse}
          </div>
        </div>

      </div>
    );
  }

}

export default App;
