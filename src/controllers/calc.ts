#!/usr/bin/env ts-node
import axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';
import { BetriebsStatusId } from '../makstr-client/interfaces/BetriebsStatusId.enum';
import { Energietraeger } from '../makstr-client/interfaces/Energietraeger.enum';
import { EinheitResponse } from '../makstr-client/responses/einheit-response.interface';

const year2021 = moment('2021-01-01T01:00:00+01:00');
const pageSize = '10000';

// const input = {
//     ort: 'Frankenthal',
//     plz: '67227',
//     einwohner: 49237,
//     gemeindeSchluessel: ''
// };

// const input = {
//     ort: 'Köln',
//     plz: '50667',
//     einwohner: 1085664,
//     gemeindeSchluessel: '05315000'
// };

// const input = {
//     ort: 'Bous',
//     plz: '66359',
//     einwohner: 7011,
//     gemeindeSchluessel: '10044122'
// };

const input = {
  ort: 'Kempen, Niederrhein',
  plz: '47906',
  einwohner: 34597,
  gemeindeSchluessel: '05166012',
};

const { plz, ort, einwohner, gemeindeSchluessel } = input;

const url =
  `https://www.marktstammdatenregister.de/MaStR/Einheit/EinheitJson/GetVerkleinerteOeffentlicheEinheitStromerzeugung?` +
  `sort=InbetriebnahmeDatum-desc&` +
  `page=1&pageSize=${pageSize}&group=&` +
  `&filter=` +
  `Betriebs-Status~eq~%27${BetriebsStatusId.IN_BETRIEB}%27~and~` +
  `Gemeindeschl%C3%BCssel~eq~%27${gemeindeSchluessel}%27~and~` +
  `Energietr%C3%A4ger~eq~%27${Energietraeger.SOLARE_STRAHLUNGSENERGIE}%27~and~`;
// + `Postleitzahl~eq~%27${plz}%27`;

// console.log(url);

axios
  .get(url)
  .then((response: AxiosResponse<EinheitResponse>) => {
    // console.log('page size: ' + pageSize);
    // console.log('data size: ' + response.data.Data.length);
    // console.log('total data size: ' + response.data.Total);

    let totalNow = 0;
    let totalEnd2020 = 0;
    response.data.Data.forEach((entry) => {
      // console.log(entry.EnergietraegerName);
      // console.log(entry.EinheitName);
      // console.log(entry.MaStRNummer);
      // console.log(entry.InbetriebnahmeDatum);
      // console.log(new Date(entry.InbetriebnahmeDatum.split('(').pop().split(')')[0]));
      // console.log(moment(entry.InbetriebnahmeDatum));
      // console.log(entry.Bruttoleistung);

      if (moment(entry.InbetriebnahmeDatum).isBefore(year2021)) {
        totalEnd2020 += entry.Bruttoleistung;
      }
      totalNow += entry.Bruttoleistung;
    });

    totalEnd2020 = Math.floor(totalEnd2020);
    totalNow = Math.floor(totalNow);

    const perResidentEnd2020 = totalEnd2020 / einwohner;
    const perResidentNow = totalNow / einwohner;

    const growth = totalNow / (totalEnd2020 / 100) - 100;

    console.log(`kWp für ${ort} (${gemeindeSchluessel})`);
    console.log(`\n################################\n`);
    console.log(`31.12.2020`);
    console.log(`  Gesamt:          ${totalEnd2020} kWp`);
    console.log(`  Pro Einwohner:   ${perResidentEnd2020} kWp/Einwohner`);
    console.log(moment().format('DD.MM.YYYY'));
    console.log(`  Gesamt:          ${totalNow} kWp`);
    console.log(`  Pro Einwohner:   ${perResidentNow} kWp/Einwohner`);
    console.log(`Wachstum 2021`);
    console.log(`  kWp:             ${totalNow - totalEnd2020} kWp`);
    console.log(`  Prozentual:      ${growth} %`);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
