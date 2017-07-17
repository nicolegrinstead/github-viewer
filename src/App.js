import React, { Component } from 'react';
import GitHub from 'github-api';
// import ReactTooltip from 'react-tooltip';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.handleOrganizationChange = this.handleOrganizationChange.bind(this);
    this.searchOrganization = this.searchOrganization.bind(this);
    this.state = {repos: [], commits: [], currentRepo:'', organization: ''};
  }

  handleOrganizationChange(e) {
    this.setState({repos: [], organization: e.target.value});
  }

  searchOrganization(e) {
    e.preventDefault();
    const gh = new GitHub();
    var organization = gh.getOrganization(this.state.organization);
    //TODO: catch error and display message if no orgs found
    organization.getRepos().then((result) => {
      var repos = result.data;
      for(var i=0; i<repos.length; i++){
        this.addRepoToState(i, repos[i]);
      }
    });
  }

  addRepoToState(id, repo){ 
    repo.id = id;
    this.setState((prevState) => ({
      repos: prevState.repos.concat(repo),
      organization: prevState.organization
    }));      
  }

  addCommitToState(id, commit, currentRepo){ 
    commit.id = id;
    this.setState((prevState) => ({
      commits: prevState.commits.concat(commit), 
      currentRepo: currentRepo,
      organization: prevState.organization
    }));      
  }

  viewCommits(repoInfo){ 
    this.setState({repos:[]});
    const gh = new GitHub();
    //TODO: limit commits by recent (Last month?) and only last 10 or 20?
    var repo = gh.getRepo(repoInfo.owner.login, repoInfo.name);
    repo.listCommits().then(
      (result) => {
        var commits = result.data;
        for(var i=0; i<commits.length; i++){
          this.addCommitToState(i, commits[i], repoInfo.name);
        }
      }
    );
  }

  render() {
    let repoList = null;
    let commitList = this.state.commits.length > 0 ? <CommitList repo={this.state.currentRepo} commits={this.state.commits} /> : null;
    if (this.state.repos.length !== 0) {
      repoList = <ul>
                  {this.state.repos.map(repo => (
                    <li key={repo.id}>
                      <a onClick={()=>this.viewCommits(repo)}> {repo.name} </a>
                    </li>
                  ))}
                </ul>;
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React Nicole</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <h3>Search for an Organization:</h3>
        <form onSubmit={this.searchOrganization}>
          <input onChange={this.handleOrganizationChange} value={this.state.organization} />
          <button>Search</button>
        </form>
        {repoList}
        {commitList}
      </div>
    );

  }
}

function CommitList(props){ 
  const commits = props.commits;
  return (
    <div>
      <h4>Recent Commits for {props.repo}</h4>
      <ul>
        {commits.map(commit => (
          <li key={commit.id}>
            <p>Commit message: {commit.commit.message}</p>
            <Author commit={commit}/>
            <Committer commit={commit}/>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Author(props){ 
  const commit = props.commit.commit;
  if (commit.author){ 
    return <p>Authored by: {commit.author.name} On: {commit.author.date}</p>;
  } else { 
    return null;
  }
}

function Committer(props){ 
  const commit = props.commit.commit;
  if (commit.committer){ 
    return <p>Commited by: {commit.committer.name} On: {commit.committer.date}</p>;
  } else { 
    return null;
  }
}

export default App;
