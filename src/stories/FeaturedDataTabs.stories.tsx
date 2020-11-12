import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import FeaturedDataTabs, { FeaturedDataTabsProps } from 'lib/containers/home_page/featured-data/FeaturedDataTabs';
import { SynapseConstants } from 'lib';

export default {
  title: 'Homepage/FeaturedDataTabs',
  component: FeaturedDataTabs,
  argTypes: {    
  },
} as Meta;

const Template: Story<FeaturedDataTabsProps> = (args) => <FeaturedDataTabs {...args} />;

export const AMP_AD = Template.bind({});
AMP_AD.args = {
  sql:'select * from syn11346063',
  rgbIndex: 3,
  configs: [{
    title: 'Human Studies',
    icon: 'PERSON',
    explorePagePath:'/Explore/Studies',
    exploreObjectType:'Studies',
    plotsConfig: {
      configs: [{
        title:'The Religious Orders and Memory and Aging Project Study',
        facetsToPlot:['dataType', 'assay'],
        selectFacetColumnName:'study',
        selectFacetColumnValue:'ROSMAP',
        detailsPagePath:'/Explore/Studies/DetailsPage?Study=syn3219045'
      },
      {
        title:'The Mount Sinai Brain Bank Study',
        facetsToPlot:['dataType', 'assay'],
        selectFacetColumnName:'study',
        selectFacetColumnValue:'MSBB',
        detailsPagePath:'/Explore/Studies/DetailsPage?Study=syn3159438'
      },
      {
        title:'The RNAseq Harmonization Study',
        facetsToPlot:['dataType', 'assay'],
        selectFacetColumnName:'study',
        selectFacetColumnValue:'rnaSeqReprocessing',
        detailsPagePath:'/Explore/Studies/DetailsPage?Study=syn9702085'
      }]
    }
  },
  {
    title: 'Animal Model Studies',
    icon: 'MOUSE',
    explorePagePath:'/Explore/Studies',
    exploreObjectType:'Studies',
    plotsConfig: {
      configs: [{
        title:'The UCI MODEL-AD 5XFAD Study',
        facetsToPlot:['dataType', 'assay'],
        selectFacetColumnName:'study',
        selectFacetColumnValue:'UCI_5XFAD',
        detailsPagePath:'/Explore/Studies/DetailsPage?Study=syn16798076'
      },
      {
        title:'The IU/Jax/Pitt MODEL-AD Primary Screen Study',
        facetsToPlot:['dataType', 'assay'],
        selectFacetColumnName:'study',
        selectFacetColumnValue:'Jax.IU.Pitt_PrimaryScreen',
        detailsPagePath:'/Explore/Studies/DetailsPage?Study=syn21595258'
      },
      {
        title:'The IU/Jax/Pit MODEL-AD APOE/TREM2 Study',
        facetsToPlot:['dataType', 'assay'],
        selectFacetColumnName:'study',
        selectFacetColumnValue:'Jax.IU.Pitt_APOE4.Trem2.R47H',
        detailsPagePath:'/Explore/Studies/DetailsPage?Study=syn17095980'
      }
    ]}
  }]  
};

export const Dhealth = Template.bind({});
Dhealth.args = {
  sql:'SELECT * FROM syn21994974',
  rgbIndex: 3,
  configs:
    [
      {
        title: 'Studies',
        icon: SynapseConstants.FILE,
        explorePagePath:'/Explore/Collections',
        exploreObjectType:'Collections',
        plotsConfig: {
          sql: 'SELECT * FROM syn21994974 WHERE ( ( "collectionType" = \'Validation Study\' OR "collectionType" = \'Interventional Study\' OR "collectionType" = \'Observational Study\' ) )',
          configs: [{
            facetsToPlot:['diagnosis', 'dataCollectionMethod','digitalAssessmentCategory', 'sensorType', 'devicePlatform' ],
          },]
        },
      },
      {
        title: 'Analysis',
        icon: SynapseConstants.CHART2,
        explorePagePath:'/Explore/Collections',
        exploreObjectType:'Collections',
        plotsConfig: {
          sql: 'SELECT * FROM syn21994974 WHERE ( ( "collectionType" = \'Analysis\' OR "collectionType" = \'Challenge\' ) )',
          configs: [{
            facetsToPlot:['diagnosis', 'dataCollectionMethod','digitalAssessmentCategory', 'sensorType', 'devicePlatform' ],
          },]
        },
      }
    ] 
}
