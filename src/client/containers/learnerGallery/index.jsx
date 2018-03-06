import React, { Component } from 'react';
import { connect } from 'react-redux';
import CollectionPage from '../collection';
import Blurb from '../../components/blurb';
import _ from 'lodash';
import { searchBySkillOrName, setAll, setAlumni, setCurrent } from '../../actions';
import { withRouter } from 'react-router-dom';
import './index.css';

class LearnerGallery extends Component {
  constructor(props) {
    super(props);
    this.props.setAll();
    this.state = {
      searchBar: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.handleSelectLearner = this.handleSelectLearner.bind(this);
    this.handleSelectSkill = this.handleSelectSkill.bind(this);
  }

  toggleSearch(event) {
    if (this.props.guild.nameSearch) {
      this.props.searchBySkill();
    } else {
      this.props.searchByName();
    }
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ searchBar: event.target.value });
  }

  handleSelectLearner(event) {
    const select = event.target.value;
    if (select === 'all') {
      this.props.setAll();
    } else if (select === 'alumni') {
      this.props.setAlumni();
    } else {
      this.props.setCurrent();
    }
  }

  handleSelectSkill(event) {
    this.props.searchBySkillOrName(event.target.value);
  }

  filterByName () {
    const learnersToFilterThrough = this.determineSubsetOfLearners(this.props.guild.typeOfLearners);
    if (!this.state.searchBar) {
      return learnersToFilterThrough;
    }

    const searchBar = this.state.searchBar.toLowerCase().split(' ')[0];
    const foundLearners = learnersToFilterThrough.filter(learner => {
      return learner.name.toLowerCase().includes(searchBar);
    });

    return foundLearners;
  }

  determineSubsetOfLearners(type) {
    if (this.props.match.params.searchSkill) {
      const searchSkills = this.props.match.params.searchSkill.replace(/search=/, '').split(',');
      return this.filterByMultipleSkills(searchSkills);
    } else {
      return this.filterByType(type);
    }
  }

  filterByOneSkill(skillToSearchBy) {
    return this.determineSubsetOfLearners(this.props.guild.typeOfLearners).filter(learner => {
      const skillKeys = Object.values(learner.skills).map(object => object.skills);
      let lowerCaseSkillKeys = skillKeys.map(key => key.toLowerCase());
      for (let i = 0; i < lowerCaseSkillKeys.length; i++) {
        if (lowerCaseSkillKeys[i].includes(skillToSearchBy)) {
          return learner;
        }
      }
    });
  }

  filterByMultipleSkills (searchArray) {
    return this.props.guild.learners.filter(learner => {
      const skillKeys = Object.values(learner.skills).map(object => object.skills);
      let lowerCaseSkillKeys = skillKeys.map(key => key.toLowerCase());
      for (let i = 0; i < searchArray.length; i++) {
        if (lowerCaseSkillKeys.includes(searchArray[i].toLowerCase())) {
          if (i + 1 === searchArray.length) {
            return learner;
          }
        } else {
          break;
        }
      }
    });
  }

  filterByType(type) {
    if (type === 'all') {
      return this.props.guild.learners;
    }

    return this.props.guild.learners.filter(learner => {
      if (type === 'alumni') {
        return learner.alumni === true;
      } else if (type === 'current') {
        return learner.alumni === false;
      }
    });
  }

  getProjects(learners) {
    const allProjects = learners.map(learner => learner.projects);
    return _.flatMapDeep(allProjects);
  }

  render() {
    let names;
    if (this.props.guild.searchBySkillOrName === 'name') {
      names = this.filterByName(this.state.searchBar);
    } else {
      names = this.filterByOneSkill(this.state.searchBar);
    }

    return (
      <div className="learner-gallery-container" >
        <Blurb info={ { name: 'FIND YOUR TALENT', story: '' } } />
        <div className="search-form">
          <input
            type="text"
            placeholder="search..."
            results="0"
            onChange={this.handleChange}
            className="searchbar"
            value={this.state.searchBar}
          />
          <select
            value={this.props.guild.typeOfLearners}
            onChange={this.handleSelectLearner}
            className="selectbar"
          >
            <option value='all'>all</option>
            <option value='alumni'>alumni</option>
            <option value='current'>current</option>
          </select>
          <select
            value={this.props.guild.searchBySkillOrName}
            onChange={this.handleSelectSkill}
            className="selectbar"
          >
            <option value="skill">skill</option>
            <option value="name">name</option>
          </select>
        </div>

        <CollectionPage
          data={names}
          projects={this.getProjects(names)}
        />
      </div>
    );
  }
}

function mapStateToProps({ guild }) {
  return { guild };
}

export default withRouter(connect(mapStateToProps, { searchBySkillOrName, setAll, setAlumni, setCurrent })(LearnerGallery));
