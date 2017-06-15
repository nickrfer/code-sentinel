// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import util from 'util';
import _ from 'lodash';
import dateFormat from 'dateformat';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { func, array, date } from 'prop-types';
import DiffSvn2Git from 'diffsvn2git';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './SvnRevisionList.css';

const workingPath = path.resolve('tmp/repo');
const diffSvn2Git = new DiffSvn2Git({ cwd: workingPath });

export default class SvnRevisionList extends Component {

  propTypes: {
    startRevisionLoading: func.isRequired
  };

  state: {
    revisions: array,
    revisionDate: date,
    onRevisionDateChanged: func.isRequired,
    startRevisionLoading: func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      revisions: [],
      revisionDate: moment('15/04/2011', 'DD/MM/YYYY')
    };
  }

  componentWillMount() {
    this.fetchRevisionList();
  }

  fetchRevisionList() {
    if (moment(this.state.revisionDate, 'DD/MM/YYYY').isValid()) {
      this.setState({ revisions: [] });

      this.props.startRevisionLoading(true);
      const self = this;
      console.log('revisionDate: ', moment(this.state.revisionDate, 'DD/MM/YYYY'));

      const revisionDateFormated = this.state.revisionDate.format('YYYY-MM-DD');
      console.log('revisionDateFormated: ', revisionDateFormated);

      diffSvn2Git.listRevisionsByDate(revisionDateFormated).then((loadedRevisions) => {
        self.setState({ revisions: loadedRevisions });
        this.props.startRevisionLoading(false);
      });
    }
  }

  createItem(rows: Array<any>, revision: Object) {
    rows.push(
      <li key={revision.$.revision}>
        <div style={styles.fileName}>
          <i className="material-icons">label</i>
          <p>{`r${revision.$.revision} | ${dateFormat(revision.date, 'dd/mm/yyyy HH:MM:ss')} | ${revision.author} | ${revision.msg}`}</p>
        </div>
      </li>
    );
  }

  render() {
    const rows = [];

    this.state.revisions.forEach(revisionList => {
      if (util.isArray(revisionList)) {
        revisionList.forEach(revision => {
          this.createItem(rows, revision);
        });
      } else {
        this.createItem(rows, revisionList);
      }
    });

    return (
      <div>
        <DatePicker
          todayButton={'Today'}
          dateFormat="DD/MM/YYYY"
          selected={this.state.revisionDate}
          onChange={this.fetchRevisionList.bind(this)}
        />
        <ul className="video-list">
          {rows}
        </ul>
      </div>
    );
  }

}
