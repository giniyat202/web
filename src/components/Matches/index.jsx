import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import heroes from 'dotaconstants/build/heroes.json';
import styled from 'styled-components';
import { transformations, subTextStyle, rankTierToString } from '../../utility';
import { getProMatches, getPublicMatches } from '../../actions';
import strings from '../../lang';
import Table, { TableLink } from '../Table';
// import Heading from '../Heading';
import { IconTrophy } from '../Icons';
import Match from '../Match';
import TabBar from '../TabBar';
import { StyledTeamIconContainer } from '../Match/StyledMatch';
import constants from '../constants';

const WinnerSpan = styled.span`
  display: inline-block;

  & svg {
    width: 10px !important;
    height: 10px !important;
    margin-right: 5px;
    fill: ${constants.colorGolden};
  }
`;

const matchesColumns = [{
  displayName: strings.th_match_id,
  field: 'match_id',
  sortFn: true,
  displayFn: (row, col, field) => (
    <div>
      <TableLink to={`/matches/${field}`}>{field}</TableLink>
      <span style={{ ...subTextStyle, display: 'block', marginTop: 1 }}>
        {row.league_name}
      </span>
    </div>),
}, {
  displayName: strings.th_duration,
  tooltip: strings.tooltip_duration,
  field: 'duration',
  sortFn: true,
  displayFn: transformations.duration,
}, {
  displayName: <StyledTeamIconContainer>{strings.general_radiant}</StyledTeamIconContainer>,
  field: 'radiant_name',
  color: constants.colorGreen,
  displayFn: (row, col, field) => <div>{row.radiant_win && <WinnerSpan><IconTrophy /></WinnerSpan>}{field}</div>,
}, {
  displayName: <StyledTeamIconContainer>{strings.general_dire}</StyledTeamIconContainer>,
  field: 'dire_name',
  color: constants.colorRed,
  displayFn: (row, col, field) => <div>{!row.radiant_win && <WinnerSpan><IconTrophy /></WinnerSpan>}{field}</div>,
}];

const publicMatchesColumns = [
  {
    displayName: strings.th_match_id,
    field: 'match_id',
    sortFn: true,
    displayFn: (row, col, field) => (
      <div>
        <TableLink to={`/matches/${field}`}>{field}</TableLink>
        <span style={{ ...subTextStyle, display: 'block', marginTop: 1 }}>
          {rankTierToString(row.avg_rank_tier)}
        </span>
      </div>),
  }, {
    displayName: strings.th_duration,
    tooltip: strings.tooltip_duration,
    field: 'duration',
    sortFn: true,
    displayFn: transformations.duration,
  },
  {
    displayName: <StyledTeamIconContainer>{strings.general_radiant}</StyledTeamIconContainer>,
    field: 'radiant_team',
    displayFn: (row, col, field) => (field || '').split(',').map(heroId =>
      (heroes[heroId] ? <img key={heroId} style={{ width: '50px' }} src={`${process.env.REACT_APP_API_HOST}${heroes[heroId].img}`} alt="" /> : null)),
  },
  {
    displayName: <StyledTeamIconContainer >{strings.general_dire}</StyledTeamIconContainer>,
    field: 'dire_team',
    displayFn: (row, col, field) => (field || '').split(',').map(heroId =>
      (heroes[heroId] ? <img key={heroId} style={{ width: '50px' }} src={`${process.env.REACT_APP_API_HOST}${heroes[heroId].img}`} alt="" /> : null)),
  },
];

const matchTabs = [{
  name: strings.hero_pro_tab,
  key: 'pro',
  content: propsPar => (
    <div>
      <Table data={propsPar.proData} columns={matchesColumns} loading={propsPar.loading} />
    </div>),
  route: '/matches/pro',
}, {
  name: strings.matches_highest_mmr,
  key: 'highMmr',
  content: propsPar => (
    <div>
      <Table data={propsPar.publicData} columns={publicMatchesColumns} loading={propsPar.loading} />
    </div>),
  route: '/matches/highMmr',
}];

const getData = (props) => {
  const route = props.match.params.matchId || 'pro';
  if (!Number.isInteger(Number(route))) {
    props.dispatchProMatches();
    props.dispatchPublicMatches({ mmr_descending: 1 });
  }
};

class RequestLayer extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        matchId: PropTypes.number,
      }),
    }),
    // proData: PropTypes.array,
    // publicData: PropTypes.array,
  }

  componentDidMount() {
    getData(this.props);
  }

  UNSAFE_componentWillUpdate(nextProps) {
    if (this.props.match.params.matchId !== nextProps.match.params.matchId) {
      getData(nextProps);
    }
  }
  render() {
    const route = this.props.match.params.matchId || 'pro';

    if (Number.isInteger(Number(route))) {
      return <Match {...this.props} matchId={route} />;
    }

    const tab = matchTabs.find(_tab => _tab.key === route);
    return (
      <div>
        <Helmet title={strings.title_matches} />
        <div>
          <TabBar
            info={route}
            tabs={matchTabs}
          />
          {tab && tab.content(this.props)}
        </div>
      </div>);
  }
}

const mapStateToProps = state => ({
  proData: state.app.proMatches.data,
  publicData: state.app.publicMatches.data,
  loading: state.app.proMatches.loading,
});

const mapDispatchToProps = dispatch => ({
  dispatchProMatches: () => dispatch(getProMatches()),
  dispatchPublicMatches: options => dispatch(getPublicMatches(options)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RequestLayer);
