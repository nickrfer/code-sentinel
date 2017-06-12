// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import _ from 'lodash';
import dateFormat from 'dateformat';
import DiffSvn2Git from 'diffsvn2git';
import styles from './SvnRevisionList.css';

const workingPath = path.resolve('tmp/repo');
console.log('working path: ', workingPath);
const diffSvn2Git = new DiffSvn2Git({ cwd: workingPath });

export default class SvnRevisionList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      revisions: []
    };
  }

  componentWillMount() {
    const self = this;
    console.log('Init render');
    diffSvn2Git.listRevisionsByDate('2015-04-12').then((loadedRevisions) => {
      console.log(loadedRevisions);

      self.setState({
          revisions: loadedRevisions
      });
    });
    console.log('End render');
  }

  render() {
    let rows = [];

    console.log('Revisions: ', this.state.revisions);
    this.state.revisions.forEach(revision => {
      rows.push(<li className="collection-item avatar" key={revision.author}>
        <i className="material-icons circle btn-floating">review</i>
        <div style={styles.fileName}>
          <p>{`r${revision.$.revision} | ${dateFormat(revision.date, 'dd/mm/yyyy HH:MM:ss')} | ${revision.author} | ${revision.msg}`}</p>
        </div>
      </li>);
    });

    return (
      <ul className="collection video-list">
        {rows}
      </ul>
    );
  }
}
