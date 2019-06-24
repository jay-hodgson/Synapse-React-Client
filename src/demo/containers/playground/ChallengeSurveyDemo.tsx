import * as React from 'react'
import RssFeed from '../../../lib/containers/RssFeed'

export const ChallengeSurveyDemo:React.SFC = () => {
  return (
    <div className="container">
      <RssFeed
        url={'https://99u.adobe.com/feed'}
      />
    </div>
  )
}
