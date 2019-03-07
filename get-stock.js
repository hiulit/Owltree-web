const APIKeys = require('./APIKeys')
const fs = require('fs')
const merge = require('deepmerge')
const rp = require('request-promise')

url =
  'https://' + APIKeys.apikey + ':' + APIKeys.password + '@' + APIKeys.hostname

let JSONArray = []
let JSONOutput = 'src/data/includes/stock.json'
let OwltreeArray = []
let stockArray = []

let options = {
  uri: url + '/admin/products/count.json',
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true
}

rp(options)
.then(function (response) {
    console.log('Getting stock ...')
    let pages = Math.ceil(response.count / 250)
    for (let i = 1; i < pages + 1; i++) {
      options.uri =
        url + '/admin/products.json?limit=250&page=' + i + '&fields=vendor,id'
      JSONArray.push(rp(options))
    }
    Promise.all(JSONArray)
      .then(function (response) {
        let JSONMerge = merge.all(response)
        for (let i = 0; i < JSONMerge.products.length; i++) {
          if (JSONMerge.products[i].vendor === 'Owltree') {
            options.uri =
              url + '/admin/products/' + JSONMerge.products[i].id + '.json'
            OwltreeArray.push(rp(options))
          }
        }
        Promise.all(OwltreeArray)
          .then(function (response) {
            for (let i = 0; i < response.length; i++) {
              let parentId = response[i].product.tags
              if (parentId.includes('vestido')) {
                parentId = 'dresses'
              }
              if (parentId.includes('camiseta')) {
                parentId = 't-shirts'
              }
              if (parentId.includes('sudadera')) {
                parentId = 'sweatshirts'
              }
              if (parentId.includes('taza')) {
                parentId = 'mugs'
              }
              if (parentId.includes('bolsa') || parentId.includes('totebag')) {
                parentId = 'tote-bags'
              }
              let id = response[i].product.handle.match(/(?<=apparel-)(.*)/)[0]
              if (id === 'animals-have-feelings') {
                id = 'feelings'
              }
              if (id === 'dont-use-animals') {
                id = 'dont-use'
              }
              if (id === 'meat-is-death') {
                id = 'death'
              }
              if (id === 'tofu-killers') {
                id = 'tofu'
              }
              if (id === 'save-the-animals') {
                id = 'save-animals'
              }
              if (id === 'too-late') {
                id = 'never-too-late'
              }
              let gender = response[i].product.product_type
              if (gender === 'Hombre, mujer') {
                gender = 'unisex'
              } else if (gender === 'Mujer') {
                gender = 'women'
              }
              if (parentId === 'mugs' || parentId === 'tote-bags') {
                gender = ''
              }
              let product = {}
              product['parentId'] = parentId
              product['id'] = id
              product['gender'] = gender
              product['sizes'] = []
              product['quantity'] = null
              let variants = response[i].product.variants
              let stockCounter = 0
              for (let i = 0; i < variants.length; i++) {
                // let price = variants[i].price
                let size = variants[i].title
                let stock = variants[i].inventory_quantity
                let variant = {}
                // product['price'] = price
                if (size !== 'Default Title') {
                  variant['size'] = size
                  variant['stock'] = stock
                  if (stock < 1) {
                    variant['stockStatus'] = 'out of stock'
                  } else {
                    variant['stockStatus'] = 'in stock'
                    stockCounter++
                  }
                  product.sizes.push(variant)
                } else {
                  product['sizes'] = null
                  product['quantity'] = stock
                  if (stock < 1) {
                    product['stockStatus'] = 'out of stock'
                  } else {
                    product['stockStatus'] = 'in stock'
                    stockCounter++
                  }
                }
                if (stockCounter < 1) {
                  product['stockGlobal'] = 'out of stock'
                } else {
                  product['stockGlobal'] = 'in stock'
                }
              }
              // console.log(product)
              stockArray.push(product)
            }
            console.log('Stock received successfully!')
            fs.writeFile(
              JSONOutput,
              JSON.stringify(stockArray, null, 4),
              function (err) {
                if (err) {
                  console.log(err)
                } else {
                  console.log('\nJSON saved to "' + JSONOutput + '"')
                }
              }
            )
          })
          .catch(function (err) {
            console.log(err)
          })
      })
      .catch(function (err) {
        console.log(err)
      })
  })
  .catch(function (err) {
    console.log(err)
  })
