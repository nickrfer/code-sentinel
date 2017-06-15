// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import util from 'util';
import _ from 'lodash';
import dateFormat from 'dateformat';
import { func, array } from 'prop-types';
import DiffSvn2Git from 'diffsvn2git';
import styles from './SvnRevisionList.css';

const workingPath = path.resolve('tmp/repo');
const diffSvn2Git = new DiffSvn2Git({ cwd: workingPath });

export default class SvnRevisionList extends Component {

  propTypes: {
    onRevisionLoaded: func.isRequired
  };

  state: {
    revisions: array,
    onRevisionLoaded: func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      revisions: []
    };
  }

  componentDidUpdate() {

  }

  componentWillMount() {
    const self = this;

    diffSvn2Git.listRevisionsByDate('2011-04-15').then((loadedRevisions) => {

      self.setState({
        revisions: loadedRevisions
      });
      console.log('onRevisionLoaded');
      this.props.onRevisionLoaded();
    });
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
        <ul className="video-list">
          {rows}
        </ul>
      </div>
    );
  }

}
