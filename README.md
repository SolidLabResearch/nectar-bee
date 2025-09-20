# Nectar Bee
Distilling the difference between different Query Bee running queries. 

## Usage
### Install

```bash
npm install nectar-bee
```

### Example

With RSP-QL Queries:
```typescript
import { NectarBee } from 'nectar-bee';

const nectar = new NectarBee();
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?temp ?humidity
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
        WHERE{
            WINDOW :w1 {
              ?s :hasTemp ?temp .
              ?s :hasHumidity ?humidity
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?temp
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
         WHERE{
             WINDOW :w1 { ?s :hasTemp ?temp }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateNectarQuery();

      /*
      Expected Output:
     PREFIX : <https://rsp.js/> REGISTER RStream <output> AS SELECT ?s ?temp ?humidity FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3] WHERE{WINDOW :w1 { ?s :hasTemp ?temp . ?s :hasHumidity ?humidity
      MINUS { ?s :hasTemp ?temp }
    } }
      */
```

The package supports both SPARQL and RSP-QL queries. For SPARQL queries, the `NectarBee` class can be used similarly, but without the windowing constructs. 

One can use both SPARQL and RSP-QL queries in the same instance of `NectarBee`. The class automatically detects the query type based on the presence of RSP-QL specific constructs. 

Currently, only sliding windows are supported for RSP-QL queries. Future versions may include support for additional window types and more complex query structures. 

Moreover, the Nectar Query generated is a basic version and may require further optimization based on specific use cases and query complexities. Currently it uses only the MINUS operator to represent the difference between queries. It was used to create a Proof of Concept (PoC) and may not be the most efficient way to represent query differences in all scenarios.

Future enhancements may include more sophisticated methods for query differencing and optimization.
## License

This code is copyrighted by [Ghent University - imec](https://www.ugent.be/ea/idlab/en) and released under the [MIT Licence](./LICENCE) 

## Contact

For any questions, please contact [Kush](mailto:mailkushbisen@gmail.com) or create an issue on the GitHub repository.