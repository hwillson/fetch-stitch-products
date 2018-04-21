/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-unused-expressions */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const StitchProductFetcher = require('../index');

chai.use(chaiAsPromised);
const { expect } = chai;

const fetcher = Object.create(StitchProductFetcher);

describe('StitchProductFetcher', function () {
  describe('#init', function () {
    it('should throw if missing clientSecret', function () {
      expect(() => { fetcher.init(); }).to.throw();
    });

    it('should not throw when a clientSecret is provided', function () {
      expect(() => { fetcher.init('abc123'); }).to.not.throw();
    });
  });

  describe('#fetchProducts', function () {
    it('should throw if clientSecret is missing', async function () {
      expect(fetcher.fetchProducts()).to.be.rejectedWith(Error);
    });

    it('should return an array of products', async function () {
      const mockStitchResponse = {
        meta: {
          current_page: '1',
          last_page: '1',
          per_page: '1',
          total: '1',
          from: '1',
          to: '1',
        },
        Variants: [],
      };
      fetcher.init('abc123');
      const products = await fetcher.fetchProducts([mockStitchResponse]);
      expect(products).to.eql([]);
    });

    function buildFakeVariants(quantity) {
      return [...Array(quantity)].map((_, i) => ({
        id: `id${i}`,
        auto_description_with_option_type: `description${i}`,
        upc: `upc${i}`,
        sku: `sku${i}`,
        stock: i,
        committed_stock: i,
        available: i,
        total_sold: i,
        average_cost: i,
        links: {
          Products: [{
            id: `id${i}`,
          }],
        },
      }));
    }

    it('should include reduced subset of product data', async function () {
      const mockStitchResponse = {
        meta: {
          current_page: '1',
          last_page: '1',
          per_page: '1',
          total: '2',
          from: '1',
          to: '1',
        },
        Variants: buildFakeVariants(5),
      };

      const variant = mockStitchResponse.Variants[3];
      const product = {
        productId: variant.links.Products[0].id,
        variantId: variant.id,
        description: variant.auto_description_with_option_type,
        upc: variant.upc,
        sku: variant.sku,
        totalStock: +variant.stock,
        committedStock: +variant.committed_stock,
        availableStock: +variant.available,
        totalSold: +variant.total_sold,
        averageCost: +variant.average_cost,
      };

      fetcher.init('abc123');
      const products = await fetcher.fetchProducts([mockStitchResponse]);
      expect(products.length).to.equal(5);
      expect(products[3]).to.eql(product);
    });

    it(
      'should fetch product data for all products across pagination',
      async function () {
        const variants = buildFakeVariants(2);
        const mockStitchResponses = [
          {
            meta: {
              current_page: '1',
              last_page: '2',
              per_page: '1',
              total: '2',
              from: '1',
              to: '1',
            },
            Variants: [variants[0]],
          },
          {
            meta: {
              current_page: '2',
              last_page: '2',
              per_page: '1',
              total: '2',
              from: '2',
              to: '2',
            },
            Variants: [variants[1]],
          },
        ];

        fetcher.init('abc123');
        const products = await fetcher.fetchProducts(mockStitchResponses);
        expect(products.length).to.equal(2);
      },
    );
  });
});
