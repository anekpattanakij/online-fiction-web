/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import FeatureFictionCard from './FeatureFictionCard';
import Loading from '../Loading';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

class FeatureCarousel extends React.Component {
  state = {
    fictionList: [],
    firstLoad: false,
  };
  responsive = () => {
    return {
      desktopBig: {
        breakpoint: { max: 3000, min: 1440 },
        items: 8,
      },
      desktop: {
        breakpoint: { max: 1440, min: 992 },
        items: 5,
      },
      desktopSmall: {
        breakpoint: { max: 992, min: 768 },
        items: 4,
      },
      tablet: {
        breakpoint: { max: 768, min: 500 },
        items: 3,
      },
      mobile: {
        breakpoint: { max: 500, min: 0 },
        items: 2,
      },
    };
  };

  componentDidUpdate(prevProps) {
    if (this.props.fictionList.length !== prevProps.fictionList.length) {
      this.carouselRef.setState({
        currentSlide: 0,
        transform: 0,
      });
      this.carouselRef.setClones();
    }
  }

  static getDerivedStateFromProps(nextProps, state) {
    // get chapter after rehydrate becuase need current user information
    const updateState = {};
    if (nextProps.fictionList && nextProps.fictionList.length > 0 && !state.firstLoad) {
      updateState.fictionList = nextProps.fictionList;
      updateState.firstLoad = true;
    }
    return updateState;
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <div className="mb-3">
          <h5 className="d-inline">{t('home:home-feature-fiction')}</h5>
        </div>
        <Loading loading={this.props.loading} t={t} />
        <Carousel
          ref={node => (this.carouselRef = node)}
          responsive={this.responsive()}
          infinite={true}
          swipeable={true}
          draggable={true}
          showDots={true}
          autoPlay={true}
          autoPlaySpeed={3000}
        >
          {Array.isArray(this.props.fictionList)
            ? this.props.fictionList.map((fictionItem, key) => (
                <FeatureFictionCard fiction={fictionItem} lng={this.props.lng} t={t} key={'featurefiction-' + key} />
              ))
            : ''}
        </Carousel>
      </React.Fragment>
    );
  }
}

FeatureCarousel.propTypes = {
  t: PropTypes.func.isRequired,
  fictionList: PropTypes.array,
  loading: PropTypes.bool,
  lng: PropTypes.string,
};

export default FeatureCarousel;
