import '@ungap/custom-elements'
import 'uce'
import loader from 'uce-loader'

loader({
  on (newTag) {
    var js = document.createElement('script')
    js.src = '/js/components/' + newTag + '.js'
    js.type = 'module'
    document.head.appendChild(js)
  }
})
