
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tratamiento
 * 
 */
export type Tratamiento = $Result.DefaultSelection<Prisma.$TratamientoPayload>
/**
 * Model SubTratamiento
 * 
 */
export type SubTratamiento = $Result.DefaultSelection<Prisma.$SubTratamientoPayload>
/**
 * Model Cita
 * 
 */
export type Cita = $Result.DefaultSelection<Prisma.$CitaPayload>
/**
 * Model FechaDisponible
 * 
 */
export type FechaDisponible = $Result.DefaultSelection<Prisma.$FechaDisponiblePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tratamientos
 * const tratamientos = await prisma.tratamiento.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tratamientos
   * const tratamientos = await prisma.tratamiento.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tratamiento`: Exposes CRUD operations for the **Tratamiento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tratamientos
    * const tratamientos = await prisma.tratamiento.findMany()
    * ```
    */
  get tratamiento(): Prisma.TratamientoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subTratamiento`: Exposes CRUD operations for the **SubTratamiento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SubTratamientos
    * const subTratamientos = await prisma.subTratamiento.findMany()
    * ```
    */
  get subTratamiento(): Prisma.SubTratamientoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cita`: Exposes CRUD operations for the **Cita** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Citas
    * const citas = await prisma.cita.findMany()
    * ```
    */
  get cita(): Prisma.CitaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fechaDisponible`: Exposes CRUD operations for the **FechaDisponible** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FechaDisponibles
    * const fechaDisponibles = await prisma.fechaDisponible.findMany()
    * ```
    */
  get fechaDisponible(): Prisma.FechaDisponibleDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tratamiento: 'Tratamiento',
    SubTratamiento: 'SubTratamiento',
    Cita: 'Cita',
    FechaDisponible: 'FechaDisponible'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tratamiento" | "subTratamiento" | "cita" | "fechaDisponible"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tratamiento: {
        payload: Prisma.$TratamientoPayload<ExtArgs>
        fields: Prisma.TratamientoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TratamientoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TratamientoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>
          }
          findFirst: {
            args: Prisma.TratamientoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TratamientoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>
          }
          findMany: {
            args: Prisma.TratamientoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>[]
          }
          create: {
            args: Prisma.TratamientoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>
          }
          createMany: {
            args: Prisma.TratamientoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TratamientoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>[]
          }
          delete: {
            args: Prisma.TratamientoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>
          }
          update: {
            args: Prisma.TratamientoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>
          }
          deleteMany: {
            args: Prisma.TratamientoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TratamientoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TratamientoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>[]
          }
          upsert: {
            args: Prisma.TratamientoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TratamientoPayload>
          }
          aggregate: {
            args: Prisma.TratamientoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTratamiento>
          }
          groupBy: {
            args: Prisma.TratamientoGroupByArgs<ExtArgs>
            result: $Utils.Optional<TratamientoGroupByOutputType>[]
          }
          count: {
            args: Prisma.TratamientoCountArgs<ExtArgs>
            result: $Utils.Optional<TratamientoCountAggregateOutputType> | number
          }
        }
      }
      SubTratamiento: {
        payload: Prisma.$SubTratamientoPayload<ExtArgs>
        fields: Prisma.SubTratamientoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubTratamientoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubTratamientoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>
          }
          findFirst: {
            args: Prisma.SubTratamientoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubTratamientoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>
          }
          findMany: {
            args: Prisma.SubTratamientoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>[]
          }
          create: {
            args: Prisma.SubTratamientoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>
          }
          createMany: {
            args: Prisma.SubTratamientoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubTratamientoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>[]
          }
          delete: {
            args: Prisma.SubTratamientoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>
          }
          update: {
            args: Prisma.SubTratamientoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>
          }
          deleteMany: {
            args: Prisma.SubTratamientoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubTratamientoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SubTratamientoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>[]
          }
          upsert: {
            args: Prisma.SubTratamientoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubTratamientoPayload>
          }
          aggregate: {
            args: Prisma.SubTratamientoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubTratamiento>
          }
          groupBy: {
            args: Prisma.SubTratamientoGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubTratamientoGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubTratamientoCountArgs<ExtArgs>
            result: $Utils.Optional<SubTratamientoCountAggregateOutputType> | number
          }
        }
      }
      Cita: {
        payload: Prisma.$CitaPayload<ExtArgs>
        fields: Prisma.CitaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CitaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CitaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>
          }
          findFirst: {
            args: Prisma.CitaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CitaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>
          }
          findMany: {
            args: Prisma.CitaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>[]
          }
          create: {
            args: Prisma.CitaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>
          }
          createMany: {
            args: Prisma.CitaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CitaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>[]
          }
          delete: {
            args: Prisma.CitaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>
          }
          update: {
            args: Prisma.CitaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>
          }
          deleteMany: {
            args: Prisma.CitaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CitaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CitaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>[]
          }
          upsert: {
            args: Prisma.CitaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CitaPayload>
          }
          aggregate: {
            args: Prisma.CitaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCita>
          }
          groupBy: {
            args: Prisma.CitaGroupByArgs<ExtArgs>
            result: $Utils.Optional<CitaGroupByOutputType>[]
          }
          count: {
            args: Prisma.CitaCountArgs<ExtArgs>
            result: $Utils.Optional<CitaCountAggregateOutputType> | number
          }
        }
      }
      FechaDisponible: {
        payload: Prisma.$FechaDisponiblePayload<ExtArgs>
        fields: Prisma.FechaDisponibleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FechaDisponibleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FechaDisponibleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>
          }
          findFirst: {
            args: Prisma.FechaDisponibleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FechaDisponibleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>
          }
          findMany: {
            args: Prisma.FechaDisponibleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>[]
          }
          create: {
            args: Prisma.FechaDisponibleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>
          }
          createMany: {
            args: Prisma.FechaDisponibleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FechaDisponibleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>[]
          }
          delete: {
            args: Prisma.FechaDisponibleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>
          }
          update: {
            args: Prisma.FechaDisponibleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>
          }
          deleteMany: {
            args: Prisma.FechaDisponibleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FechaDisponibleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FechaDisponibleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>[]
          }
          upsert: {
            args: Prisma.FechaDisponibleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FechaDisponiblePayload>
          }
          aggregate: {
            args: Prisma.FechaDisponibleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFechaDisponible>
          }
          groupBy: {
            args: Prisma.FechaDisponibleGroupByArgs<ExtArgs>
            result: $Utils.Optional<FechaDisponibleGroupByOutputType>[]
          }
          count: {
            args: Prisma.FechaDisponibleCountArgs<ExtArgs>
            result: $Utils.Optional<FechaDisponibleCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    tratamiento?: TratamientoOmit
    subTratamiento?: SubTratamientoOmit
    cita?: CitaOmit
    fechaDisponible?: FechaDisponibleOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TratamientoCountOutputType
   */

  export type TratamientoCountOutputType = {
    subTratamientos: number
    citas: number
    fechasDisponibles: number
  }

  export type TratamientoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subTratamientos?: boolean | TratamientoCountOutputTypeCountSubTratamientosArgs
    citas?: boolean | TratamientoCountOutputTypeCountCitasArgs
    fechasDisponibles?: boolean | TratamientoCountOutputTypeCountFechasDisponiblesArgs
  }

  // Custom InputTypes
  /**
   * TratamientoCountOutputType without action
   */
  export type TratamientoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TratamientoCountOutputType
     */
    select?: TratamientoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TratamientoCountOutputType without action
   */
  export type TratamientoCountOutputTypeCountSubTratamientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubTratamientoWhereInput
  }

  /**
   * TratamientoCountOutputType without action
   */
  export type TratamientoCountOutputTypeCountCitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitaWhereInput
  }

  /**
   * TratamientoCountOutputType without action
   */
  export type TratamientoCountOutputTypeCountFechasDisponiblesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FechaDisponibleWhereInput
  }


  /**
   * Count Type SubTratamientoCountOutputType
   */

  export type SubTratamientoCountOutputType = {
    citas: number
  }

  export type SubTratamientoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    citas?: boolean | SubTratamientoCountOutputTypeCountCitasArgs
  }

  // Custom InputTypes
  /**
   * SubTratamientoCountOutputType without action
   */
  export type SubTratamientoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamientoCountOutputType
     */
    select?: SubTratamientoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SubTratamientoCountOutputType without action
   */
  export type SubTratamientoCountOutputTypeCountCitasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tratamiento
   */

  export type AggregateTratamiento = {
    _count: TratamientoCountAggregateOutputType | null
    _min: TratamientoMinAggregateOutputType | null
    _max: TratamientoMaxAggregateOutputType | null
  }

  export type TratamientoMinAggregateOutputType = {
    id: string | null
    nombre: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TratamientoMaxAggregateOutputType = {
    id: string | null
    nombre: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TratamientoCountAggregateOutputType = {
    id: number
    nombre: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TratamientoMinAggregateInputType = {
    id?: true
    nombre?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TratamientoMaxAggregateInputType = {
    id?: true
    nombre?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TratamientoCountAggregateInputType = {
    id?: true
    nombre?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TratamientoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tratamiento to aggregate.
     */
    where?: TratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tratamientos to fetch.
     */
    orderBy?: TratamientoOrderByWithRelationInput | TratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tratamientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tratamientos
    **/
    _count?: true | TratamientoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TratamientoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TratamientoMaxAggregateInputType
  }

  export type GetTratamientoAggregateType<T extends TratamientoAggregateArgs> = {
        [P in keyof T & keyof AggregateTratamiento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTratamiento[P]>
      : GetScalarType<T[P], AggregateTratamiento[P]>
  }




  export type TratamientoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TratamientoWhereInput
    orderBy?: TratamientoOrderByWithAggregationInput | TratamientoOrderByWithAggregationInput[]
    by: TratamientoScalarFieldEnum[] | TratamientoScalarFieldEnum
    having?: TratamientoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TratamientoCountAggregateInputType | true
    _min?: TratamientoMinAggregateInputType
    _max?: TratamientoMaxAggregateInputType
  }

  export type TratamientoGroupByOutputType = {
    id: string
    nombre: string
    createdAt: Date
    updatedAt: Date
    _count: TratamientoCountAggregateOutputType | null
    _min: TratamientoMinAggregateOutputType | null
    _max: TratamientoMaxAggregateOutputType | null
  }

  type GetTratamientoGroupByPayload<T extends TratamientoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TratamientoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TratamientoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TratamientoGroupByOutputType[P]>
            : GetScalarType<T[P], TratamientoGroupByOutputType[P]>
        }
      >
    >


  export type TratamientoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    subTratamientos?: boolean | Tratamiento$subTratamientosArgs<ExtArgs>
    citas?: boolean | Tratamiento$citasArgs<ExtArgs>
    fechasDisponibles?: boolean | Tratamiento$fechasDisponiblesArgs<ExtArgs>
    _count?: boolean | TratamientoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tratamiento"]>

  export type TratamientoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tratamiento"]>

  export type TratamientoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tratamiento"]>

  export type TratamientoSelectScalar = {
    id?: boolean
    nombre?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TratamientoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombre" | "createdAt" | "updatedAt", ExtArgs["result"]["tratamiento"]>
  export type TratamientoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subTratamientos?: boolean | Tratamiento$subTratamientosArgs<ExtArgs>
    citas?: boolean | Tratamiento$citasArgs<ExtArgs>
    fechasDisponibles?: boolean | Tratamiento$fechasDisponiblesArgs<ExtArgs>
    _count?: boolean | TratamientoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TratamientoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TratamientoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TratamientoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tratamiento"
    objects: {
      subTratamientos: Prisma.$SubTratamientoPayload<ExtArgs>[]
      citas: Prisma.$CitaPayload<ExtArgs>[]
      fechasDisponibles: Prisma.$FechaDisponiblePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombre: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tratamiento"]>
    composites: {}
  }

  type TratamientoGetPayload<S extends boolean | null | undefined | TratamientoDefaultArgs> = $Result.GetResult<Prisma.$TratamientoPayload, S>

  type TratamientoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TratamientoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TratamientoCountAggregateInputType | true
    }

  export interface TratamientoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tratamiento'], meta: { name: 'Tratamiento' } }
    /**
     * Find zero or one Tratamiento that matches the filter.
     * @param {TratamientoFindUniqueArgs} args - Arguments to find a Tratamiento
     * @example
     * // Get one Tratamiento
     * const tratamiento = await prisma.tratamiento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TratamientoFindUniqueArgs>(args: SelectSubset<T, TratamientoFindUniqueArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tratamiento that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TratamientoFindUniqueOrThrowArgs} args - Arguments to find a Tratamiento
     * @example
     * // Get one Tratamiento
     * const tratamiento = await prisma.tratamiento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TratamientoFindUniqueOrThrowArgs>(args: SelectSubset<T, TratamientoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tratamiento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoFindFirstArgs} args - Arguments to find a Tratamiento
     * @example
     * // Get one Tratamiento
     * const tratamiento = await prisma.tratamiento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TratamientoFindFirstArgs>(args?: SelectSubset<T, TratamientoFindFirstArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tratamiento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoFindFirstOrThrowArgs} args - Arguments to find a Tratamiento
     * @example
     * // Get one Tratamiento
     * const tratamiento = await prisma.tratamiento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TratamientoFindFirstOrThrowArgs>(args?: SelectSubset<T, TratamientoFindFirstOrThrowArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tratamientos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tratamientos
     * const tratamientos = await prisma.tratamiento.findMany()
     * 
     * // Get first 10 Tratamientos
     * const tratamientos = await prisma.tratamiento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tratamientoWithIdOnly = await prisma.tratamiento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TratamientoFindManyArgs>(args?: SelectSubset<T, TratamientoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tratamiento.
     * @param {TratamientoCreateArgs} args - Arguments to create a Tratamiento.
     * @example
     * // Create one Tratamiento
     * const Tratamiento = await prisma.tratamiento.create({
     *   data: {
     *     // ... data to create a Tratamiento
     *   }
     * })
     * 
     */
    create<T extends TratamientoCreateArgs>(args: SelectSubset<T, TratamientoCreateArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tratamientos.
     * @param {TratamientoCreateManyArgs} args - Arguments to create many Tratamientos.
     * @example
     * // Create many Tratamientos
     * const tratamiento = await prisma.tratamiento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TratamientoCreateManyArgs>(args?: SelectSubset<T, TratamientoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tratamientos and returns the data saved in the database.
     * @param {TratamientoCreateManyAndReturnArgs} args - Arguments to create many Tratamientos.
     * @example
     * // Create many Tratamientos
     * const tratamiento = await prisma.tratamiento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tratamientos and only return the `id`
     * const tratamientoWithIdOnly = await prisma.tratamiento.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TratamientoCreateManyAndReturnArgs>(args?: SelectSubset<T, TratamientoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tratamiento.
     * @param {TratamientoDeleteArgs} args - Arguments to delete one Tratamiento.
     * @example
     * // Delete one Tratamiento
     * const Tratamiento = await prisma.tratamiento.delete({
     *   where: {
     *     // ... filter to delete one Tratamiento
     *   }
     * })
     * 
     */
    delete<T extends TratamientoDeleteArgs>(args: SelectSubset<T, TratamientoDeleteArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tratamiento.
     * @param {TratamientoUpdateArgs} args - Arguments to update one Tratamiento.
     * @example
     * // Update one Tratamiento
     * const tratamiento = await prisma.tratamiento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TratamientoUpdateArgs>(args: SelectSubset<T, TratamientoUpdateArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tratamientos.
     * @param {TratamientoDeleteManyArgs} args - Arguments to filter Tratamientos to delete.
     * @example
     * // Delete a few Tratamientos
     * const { count } = await prisma.tratamiento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TratamientoDeleteManyArgs>(args?: SelectSubset<T, TratamientoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tratamientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tratamientos
     * const tratamiento = await prisma.tratamiento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TratamientoUpdateManyArgs>(args: SelectSubset<T, TratamientoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tratamientos and returns the data updated in the database.
     * @param {TratamientoUpdateManyAndReturnArgs} args - Arguments to update many Tratamientos.
     * @example
     * // Update many Tratamientos
     * const tratamiento = await prisma.tratamiento.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tratamientos and only return the `id`
     * const tratamientoWithIdOnly = await prisma.tratamiento.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TratamientoUpdateManyAndReturnArgs>(args: SelectSubset<T, TratamientoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tratamiento.
     * @param {TratamientoUpsertArgs} args - Arguments to update or create a Tratamiento.
     * @example
     * // Update or create a Tratamiento
     * const tratamiento = await prisma.tratamiento.upsert({
     *   create: {
     *     // ... data to create a Tratamiento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tratamiento we want to update
     *   }
     * })
     */
    upsert<T extends TratamientoUpsertArgs>(args: SelectSubset<T, TratamientoUpsertArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tratamientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoCountArgs} args - Arguments to filter Tratamientos to count.
     * @example
     * // Count the number of Tratamientos
     * const count = await prisma.tratamiento.count({
     *   where: {
     *     // ... the filter for the Tratamientos we want to count
     *   }
     * })
    **/
    count<T extends TratamientoCountArgs>(
      args?: Subset<T, TratamientoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TratamientoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tratamiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TratamientoAggregateArgs>(args: Subset<T, TratamientoAggregateArgs>): Prisma.PrismaPromise<GetTratamientoAggregateType<T>>

    /**
     * Group by Tratamiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TratamientoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TratamientoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TratamientoGroupByArgs['orderBy'] }
        : { orderBy?: TratamientoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TratamientoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTratamientoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tratamiento model
   */
  readonly fields: TratamientoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tratamiento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TratamientoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    subTratamientos<T extends Tratamiento$subTratamientosArgs<ExtArgs> = {}>(args?: Subset<T, Tratamiento$subTratamientosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    citas<T extends Tratamiento$citasArgs<ExtArgs> = {}>(args?: Subset<T, Tratamiento$citasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    fechasDisponibles<T extends Tratamiento$fechasDisponiblesArgs<ExtArgs> = {}>(args?: Subset<T, Tratamiento$fechasDisponiblesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tratamiento model
   */
  interface TratamientoFieldRefs {
    readonly id: FieldRef<"Tratamiento", 'String'>
    readonly nombre: FieldRef<"Tratamiento", 'String'>
    readonly createdAt: FieldRef<"Tratamiento", 'DateTime'>
    readonly updatedAt: FieldRef<"Tratamiento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tratamiento findUnique
   */
  export type TratamientoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * Filter, which Tratamiento to fetch.
     */
    where: TratamientoWhereUniqueInput
  }

  /**
   * Tratamiento findUniqueOrThrow
   */
  export type TratamientoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * Filter, which Tratamiento to fetch.
     */
    where: TratamientoWhereUniqueInput
  }

  /**
   * Tratamiento findFirst
   */
  export type TratamientoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * Filter, which Tratamiento to fetch.
     */
    where?: TratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tratamientos to fetch.
     */
    orderBy?: TratamientoOrderByWithRelationInput | TratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tratamientos.
     */
    cursor?: TratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tratamientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tratamientos.
     */
    distinct?: TratamientoScalarFieldEnum | TratamientoScalarFieldEnum[]
  }

  /**
   * Tratamiento findFirstOrThrow
   */
  export type TratamientoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * Filter, which Tratamiento to fetch.
     */
    where?: TratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tratamientos to fetch.
     */
    orderBy?: TratamientoOrderByWithRelationInput | TratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tratamientos.
     */
    cursor?: TratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tratamientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tratamientos.
     */
    distinct?: TratamientoScalarFieldEnum | TratamientoScalarFieldEnum[]
  }

  /**
   * Tratamiento findMany
   */
  export type TratamientoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * Filter, which Tratamientos to fetch.
     */
    where?: TratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tratamientos to fetch.
     */
    orderBy?: TratamientoOrderByWithRelationInput | TratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tratamientos.
     */
    cursor?: TratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tratamientos.
     */
    skip?: number
    distinct?: TratamientoScalarFieldEnum | TratamientoScalarFieldEnum[]
  }

  /**
   * Tratamiento create
   */
  export type TratamientoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * The data needed to create a Tratamiento.
     */
    data: XOR<TratamientoCreateInput, TratamientoUncheckedCreateInput>
  }

  /**
   * Tratamiento createMany
   */
  export type TratamientoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tratamientos.
     */
    data: TratamientoCreateManyInput | TratamientoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tratamiento createManyAndReturn
   */
  export type TratamientoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * The data used to create many Tratamientos.
     */
    data: TratamientoCreateManyInput | TratamientoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tratamiento update
   */
  export type TratamientoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * The data needed to update a Tratamiento.
     */
    data: XOR<TratamientoUpdateInput, TratamientoUncheckedUpdateInput>
    /**
     * Choose, which Tratamiento to update.
     */
    where: TratamientoWhereUniqueInput
  }

  /**
   * Tratamiento updateMany
   */
  export type TratamientoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tratamientos.
     */
    data: XOR<TratamientoUpdateManyMutationInput, TratamientoUncheckedUpdateManyInput>
    /**
     * Filter which Tratamientos to update
     */
    where?: TratamientoWhereInput
    /**
     * Limit how many Tratamientos to update.
     */
    limit?: number
  }

  /**
   * Tratamiento updateManyAndReturn
   */
  export type TratamientoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * The data used to update Tratamientos.
     */
    data: XOR<TratamientoUpdateManyMutationInput, TratamientoUncheckedUpdateManyInput>
    /**
     * Filter which Tratamientos to update
     */
    where?: TratamientoWhereInput
    /**
     * Limit how many Tratamientos to update.
     */
    limit?: number
  }

  /**
   * Tratamiento upsert
   */
  export type TratamientoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * The filter to search for the Tratamiento to update in case it exists.
     */
    where: TratamientoWhereUniqueInput
    /**
     * In case the Tratamiento found by the `where` argument doesn't exist, create a new Tratamiento with this data.
     */
    create: XOR<TratamientoCreateInput, TratamientoUncheckedCreateInput>
    /**
     * In case the Tratamiento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TratamientoUpdateInput, TratamientoUncheckedUpdateInput>
  }

  /**
   * Tratamiento delete
   */
  export type TratamientoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
    /**
     * Filter which Tratamiento to delete.
     */
    where: TratamientoWhereUniqueInput
  }

  /**
   * Tratamiento deleteMany
   */
  export type TratamientoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tratamientos to delete
     */
    where?: TratamientoWhereInput
    /**
     * Limit how many Tratamientos to delete.
     */
    limit?: number
  }

  /**
   * Tratamiento.subTratamientos
   */
  export type Tratamiento$subTratamientosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    where?: SubTratamientoWhereInput
    orderBy?: SubTratamientoOrderByWithRelationInput | SubTratamientoOrderByWithRelationInput[]
    cursor?: SubTratamientoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubTratamientoScalarFieldEnum | SubTratamientoScalarFieldEnum[]
  }

  /**
   * Tratamiento.citas
   */
  export type Tratamiento$citasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    where?: CitaWhereInput
    orderBy?: CitaOrderByWithRelationInput | CitaOrderByWithRelationInput[]
    cursor?: CitaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CitaScalarFieldEnum | CitaScalarFieldEnum[]
  }

  /**
   * Tratamiento.fechasDisponibles
   */
  export type Tratamiento$fechasDisponiblesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    where?: FechaDisponibleWhereInput
    orderBy?: FechaDisponibleOrderByWithRelationInput | FechaDisponibleOrderByWithRelationInput[]
    cursor?: FechaDisponibleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FechaDisponibleScalarFieldEnum | FechaDisponibleScalarFieldEnum[]
  }

  /**
   * Tratamiento without action
   */
  export type TratamientoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tratamiento
     */
    select?: TratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tratamiento
     */
    omit?: TratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TratamientoInclude<ExtArgs> | null
  }


  /**
   * Model SubTratamiento
   */

  export type AggregateSubTratamiento = {
    _count: SubTratamientoCountAggregateOutputType | null
    _avg: SubTratamientoAvgAggregateOutputType | null
    _sum: SubTratamientoSumAggregateOutputType | null
    _min: SubTratamientoMinAggregateOutputType | null
    _max: SubTratamientoMaxAggregateOutputType | null
  }

  export type SubTratamientoAvgAggregateOutputType = {
    duracion: number | null
    precio: Decimal | null
  }

  export type SubTratamientoSumAggregateOutputType = {
    duracion: number | null
    precio: Decimal | null
  }

  export type SubTratamientoMinAggregateOutputType = {
    id: string | null
    tratamientoId: string | null
    nombre: string | null
    duracion: number | null
    precio: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubTratamientoMaxAggregateOutputType = {
    id: string | null
    tratamientoId: string | null
    nombre: string | null
    duracion: number | null
    precio: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SubTratamientoCountAggregateOutputType = {
    id: number
    tratamientoId: number
    nombre: number
    duracion: number
    precio: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SubTratamientoAvgAggregateInputType = {
    duracion?: true
    precio?: true
  }

  export type SubTratamientoSumAggregateInputType = {
    duracion?: true
    precio?: true
  }

  export type SubTratamientoMinAggregateInputType = {
    id?: true
    tratamientoId?: true
    nombre?: true
    duracion?: true
    precio?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubTratamientoMaxAggregateInputType = {
    id?: true
    tratamientoId?: true
    nombre?: true
    duracion?: true
    precio?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SubTratamientoCountAggregateInputType = {
    id?: true
    tratamientoId?: true
    nombre?: true
    duracion?: true
    precio?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SubTratamientoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SubTratamiento to aggregate.
     */
    where?: SubTratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubTratamientos to fetch.
     */
    orderBy?: SubTratamientoOrderByWithRelationInput | SubTratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubTratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubTratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubTratamientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SubTratamientos
    **/
    _count?: true | SubTratamientoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubTratamientoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubTratamientoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubTratamientoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubTratamientoMaxAggregateInputType
  }

  export type GetSubTratamientoAggregateType<T extends SubTratamientoAggregateArgs> = {
        [P in keyof T & keyof AggregateSubTratamiento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubTratamiento[P]>
      : GetScalarType<T[P], AggregateSubTratamiento[P]>
  }




  export type SubTratamientoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubTratamientoWhereInput
    orderBy?: SubTratamientoOrderByWithAggregationInput | SubTratamientoOrderByWithAggregationInput[]
    by: SubTratamientoScalarFieldEnum[] | SubTratamientoScalarFieldEnum
    having?: SubTratamientoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubTratamientoCountAggregateInputType | true
    _avg?: SubTratamientoAvgAggregateInputType
    _sum?: SubTratamientoSumAggregateInputType
    _min?: SubTratamientoMinAggregateInputType
    _max?: SubTratamientoMaxAggregateInputType
  }

  export type SubTratamientoGroupByOutputType = {
    id: string
    tratamientoId: string
    nombre: string
    duracion: number
    precio: Decimal
    createdAt: Date
    updatedAt: Date
    _count: SubTratamientoCountAggregateOutputType | null
    _avg: SubTratamientoAvgAggregateOutputType | null
    _sum: SubTratamientoSumAggregateOutputType | null
    _min: SubTratamientoMinAggregateOutputType | null
    _max: SubTratamientoMaxAggregateOutputType | null
  }

  type GetSubTratamientoGroupByPayload<T extends SubTratamientoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubTratamientoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubTratamientoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubTratamientoGroupByOutputType[P]>
            : GetScalarType<T[P], SubTratamientoGroupByOutputType[P]>
        }
      >
    >


  export type SubTratamientoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tratamientoId?: boolean
    nombre?: boolean
    duracion?: boolean
    precio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    citas?: boolean | SubTratamiento$citasArgs<ExtArgs>
    _count?: boolean | SubTratamientoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subTratamiento"]>

  export type SubTratamientoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tratamientoId?: boolean
    nombre?: boolean
    duracion?: boolean
    precio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subTratamiento"]>

  export type SubTratamientoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tratamientoId?: boolean
    nombre?: boolean
    duracion?: boolean
    precio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subTratamiento"]>

  export type SubTratamientoSelectScalar = {
    id?: boolean
    tratamientoId?: boolean
    nombre?: boolean
    duracion?: boolean
    precio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SubTratamientoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tratamientoId" | "nombre" | "duracion" | "precio" | "createdAt" | "updatedAt", ExtArgs["result"]["subTratamiento"]>
  export type SubTratamientoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    citas?: boolean | SubTratamiento$citasArgs<ExtArgs>
    _count?: boolean | SubTratamientoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SubTratamientoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }
  export type SubTratamientoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }

  export type $SubTratamientoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SubTratamiento"
    objects: {
      tratamiento: Prisma.$TratamientoPayload<ExtArgs>
      citas: Prisma.$CitaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tratamientoId: string
      nombre: string
      duracion: number
      precio: Prisma.Decimal
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["subTratamiento"]>
    composites: {}
  }

  type SubTratamientoGetPayload<S extends boolean | null | undefined | SubTratamientoDefaultArgs> = $Result.GetResult<Prisma.$SubTratamientoPayload, S>

  type SubTratamientoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SubTratamientoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubTratamientoCountAggregateInputType | true
    }

  export interface SubTratamientoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SubTratamiento'], meta: { name: 'SubTratamiento' } }
    /**
     * Find zero or one SubTratamiento that matches the filter.
     * @param {SubTratamientoFindUniqueArgs} args - Arguments to find a SubTratamiento
     * @example
     * // Get one SubTratamiento
     * const subTratamiento = await prisma.subTratamiento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubTratamientoFindUniqueArgs>(args: SelectSubset<T, SubTratamientoFindUniqueArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SubTratamiento that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SubTratamientoFindUniqueOrThrowArgs} args - Arguments to find a SubTratamiento
     * @example
     * // Get one SubTratamiento
     * const subTratamiento = await prisma.subTratamiento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubTratamientoFindUniqueOrThrowArgs>(args: SelectSubset<T, SubTratamientoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SubTratamiento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoFindFirstArgs} args - Arguments to find a SubTratamiento
     * @example
     * // Get one SubTratamiento
     * const subTratamiento = await prisma.subTratamiento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubTratamientoFindFirstArgs>(args?: SelectSubset<T, SubTratamientoFindFirstArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SubTratamiento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoFindFirstOrThrowArgs} args - Arguments to find a SubTratamiento
     * @example
     * // Get one SubTratamiento
     * const subTratamiento = await prisma.subTratamiento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubTratamientoFindFirstOrThrowArgs>(args?: SelectSubset<T, SubTratamientoFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SubTratamientos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SubTratamientos
     * const subTratamientos = await prisma.subTratamiento.findMany()
     * 
     * // Get first 10 SubTratamientos
     * const subTratamientos = await prisma.subTratamiento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subTratamientoWithIdOnly = await prisma.subTratamiento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubTratamientoFindManyArgs>(args?: SelectSubset<T, SubTratamientoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SubTratamiento.
     * @param {SubTratamientoCreateArgs} args - Arguments to create a SubTratamiento.
     * @example
     * // Create one SubTratamiento
     * const SubTratamiento = await prisma.subTratamiento.create({
     *   data: {
     *     // ... data to create a SubTratamiento
     *   }
     * })
     * 
     */
    create<T extends SubTratamientoCreateArgs>(args: SelectSubset<T, SubTratamientoCreateArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SubTratamientos.
     * @param {SubTratamientoCreateManyArgs} args - Arguments to create many SubTratamientos.
     * @example
     * // Create many SubTratamientos
     * const subTratamiento = await prisma.subTratamiento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubTratamientoCreateManyArgs>(args?: SelectSubset<T, SubTratamientoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SubTratamientos and returns the data saved in the database.
     * @param {SubTratamientoCreateManyAndReturnArgs} args - Arguments to create many SubTratamientos.
     * @example
     * // Create many SubTratamientos
     * const subTratamiento = await prisma.subTratamiento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SubTratamientos and only return the `id`
     * const subTratamientoWithIdOnly = await prisma.subTratamiento.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubTratamientoCreateManyAndReturnArgs>(args?: SelectSubset<T, SubTratamientoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SubTratamiento.
     * @param {SubTratamientoDeleteArgs} args - Arguments to delete one SubTratamiento.
     * @example
     * // Delete one SubTratamiento
     * const SubTratamiento = await prisma.subTratamiento.delete({
     *   where: {
     *     // ... filter to delete one SubTratamiento
     *   }
     * })
     * 
     */
    delete<T extends SubTratamientoDeleteArgs>(args: SelectSubset<T, SubTratamientoDeleteArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SubTratamiento.
     * @param {SubTratamientoUpdateArgs} args - Arguments to update one SubTratamiento.
     * @example
     * // Update one SubTratamiento
     * const subTratamiento = await prisma.subTratamiento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubTratamientoUpdateArgs>(args: SelectSubset<T, SubTratamientoUpdateArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SubTratamientos.
     * @param {SubTratamientoDeleteManyArgs} args - Arguments to filter SubTratamientos to delete.
     * @example
     * // Delete a few SubTratamientos
     * const { count } = await prisma.subTratamiento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubTratamientoDeleteManyArgs>(args?: SelectSubset<T, SubTratamientoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SubTratamientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SubTratamientos
     * const subTratamiento = await prisma.subTratamiento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubTratamientoUpdateManyArgs>(args: SelectSubset<T, SubTratamientoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SubTratamientos and returns the data updated in the database.
     * @param {SubTratamientoUpdateManyAndReturnArgs} args - Arguments to update many SubTratamientos.
     * @example
     * // Update many SubTratamientos
     * const subTratamiento = await prisma.subTratamiento.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SubTratamientos and only return the `id`
     * const subTratamientoWithIdOnly = await prisma.subTratamiento.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SubTratamientoUpdateManyAndReturnArgs>(args: SelectSubset<T, SubTratamientoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SubTratamiento.
     * @param {SubTratamientoUpsertArgs} args - Arguments to update or create a SubTratamiento.
     * @example
     * // Update or create a SubTratamiento
     * const subTratamiento = await prisma.subTratamiento.upsert({
     *   create: {
     *     // ... data to create a SubTratamiento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SubTratamiento we want to update
     *   }
     * })
     */
    upsert<T extends SubTratamientoUpsertArgs>(args: SelectSubset<T, SubTratamientoUpsertArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SubTratamientos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoCountArgs} args - Arguments to filter SubTratamientos to count.
     * @example
     * // Count the number of SubTratamientos
     * const count = await prisma.subTratamiento.count({
     *   where: {
     *     // ... the filter for the SubTratamientos we want to count
     *   }
     * })
    **/
    count<T extends SubTratamientoCountArgs>(
      args?: Subset<T, SubTratamientoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubTratamientoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SubTratamiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubTratamientoAggregateArgs>(args: Subset<T, SubTratamientoAggregateArgs>): Prisma.PrismaPromise<GetSubTratamientoAggregateType<T>>

    /**
     * Group by SubTratamiento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubTratamientoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubTratamientoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubTratamientoGroupByArgs['orderBy'] }
        : { orderBy?: SubTratamientoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubTratamientoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubTratamientoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SubTratamiento model
   */
  readonly fields: SubTratamientoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SubTratamiento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubTratamientoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tratamiento<T extends TratamientoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TratamientoDefaultArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    citas<T extends SubTratamiento$citasArgs<ExtArgs> = {}>(args?: Subset<T, SubTratamiento$citasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SubTratamiento model
   */
  interface SubTratamientoFieldRefs {
    readonly id: FieldRef<"SubTratamiento", 'String'>
    readonly tratamientoId: FieldRef<"SubTratamiento", 'String'>
    readonly nombre: FieldRef<"SubTratamiento", 'String'>
    readonly duracion: FieldRef<"SubTratamiento", 'Int'>
    readonly precio: FieldRef<"SubTratamiento", 'Decimal'>
    readonly createdAt: FieldRef<"SubTratamiento", 'DateTime'>
    readonly updatedAt: FieldRef<"SubTratamiento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SubTratamiento findUnique
   */
  export type SubTratamientoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * Filter, which SubTratamiento to fetch.
     */
    where: SubTratamientoWhereUniqueInput
  }

  /**
   * SubTratamiento findUniqueOrThrow
   */
  export type SubTratamientoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * Filter, which SubTratamiento to fetch.
     */
    where: SubTratamientoWhereUniqueInput
  }

  /**
   * SubTratamiento findFirst
   */
  export type SubTratamientoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * Filter, which SubTratamiento to fetch.
     */
    where?: SubTratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubTratamientos to fetch.
     */
    orderBy?: SubTratamientoOrderByWithRelationInput | SubTratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SubTratamientos.
     */
    cursor?: SubTratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubTratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubTratamientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SubTratamientos.
     */
    distinct?: SubTratamientoScalarFieldEnum | SubTratamientoScalarFieldEnum[]
  }

  /**
   * SubTratamiento findFirstOrThrow
   */
  export type SubTratamientoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * Filter, which SubTratamiento to fetch.
     */
    where?: SubTratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubTratamientos to fetch.
     */
    orderBy?: SubTratamientoOrderByWithRelationInput | SubTratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SubTratamientos.
     */
    cursor?: SubTratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubTratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubTratamientos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SubTratamientos.
     */
    distinct?: SubTratamientoScalarFieldEnum | SubTratamientoScalarFieldEnum[]
  }

  /**
   * SubTratamiento findMany
   */
  export type SubTratamientoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * Filter, which SubTratamientos to fetch.
     */
    where?: SubTratamientoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubTratamientos to fetch.
     */
    orderBy?: SubTratamientoOrderByWithRelationInput | SubTratamientoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SubTratamientos.
     */
    cursor?: SubTratamientoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubTratamientos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubTratamientos.
     */
    skip?: number
    distinct?: SubTratamientoScalarFieldEnum | SubTratamientoScalarFieldEnum[]
  }

  /**
   * SubTratamiento create
   */
  export type SubTratamientoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * The data needed to create a SubTratamiento.
     */
    data: XOR<SubTratamientoCreateInput, SubTratamientoUncheckedCreateInput>
  }

  /**
   * SubTratamiento createMany
   */
  export type SubTratamientoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SubTratamientos.
     */
    data: SubTratamientoCreateManyInput | SubTratamientoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SubTratamiento createManyAndReturn
   */
  export type SubTratamientoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * The data used to create many SubTratamientos.
     */
    data: SubTratamientoCreateManyInput | SubTratamientoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SubTratamiento update
   */
  export type SubTratamientoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * The data needed to update a SubTratamiento.
     */
    data: XOR<SubTratamientoUpdateInput, SubTratamientoUncheckedUpdateInput>
    /**
     * Choose, which SubTratamiento to update.
     */
    where: SubTratamientoWhereUniqueInput
  }

  /**
   * SubTratamiento updateMany
   */
  export type SubTratamientoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SubTratamientos.
     */
    data: XOR<SubTratamientoUpdateManyMutationInput, SubTratamientoUncheckedUpdateManyInput>
    /**
     * Filter which SubTratamientos to update
     */
    where?: SubTratamientoWhereInput
    /**
     * Limit how many SubTratamientos to update.
     */
    limit?: number
  }

  /**
   * SubTratamiento updateManyAndReturn
   */
  export type SubTratamientoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * The data used to update SubTratamientos.
     */
    data: XOR<SubTratamientoUpdateManyMutationInput, SubTratamientoUncheckedUpdateManyInput>
    /**
     * Filter which SubTratamientos to update
     */
    where?: SubTratamientoWhereInput
    /**
     * Limit how many SubTratamientos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SubTratamiento upsert
   */
  export type SubTratamientoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * The filter to search for the SubTratamiento to update in case it exists.
     */
    where: SubTratamientoWhereUniqueInput
    /**
     * In case the SubTratamiento found by the `where` argument doesn't exist, create a new SubTratamiento with this data.
     */
    create: XOR<SubTratamientoCreateInput, SubTratamientoUncheckedCreateInput>
    /**
     * In case the SubTratamiento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubTratamientoUpdateInput, SubTratamientoUncheckedUpdateInput>
  }

  /**
   * SubTratamiento delete
   */
  export type SubTratamientoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
    /**
     * Filter which SubTratamiento to delete.
     */
    where: SubTratamientoWhereUniqueInput
  }

  /**
   * SubTratamiento deleteMany
   */
  export type SubTratamientoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SubTratamientos to delete
     */
    where?: SubTratamientoWhereInput
    /**
     * Limit how many SubTratamientos to delete.
     */
    limit?: number
  }

  /**
   * SubTratamiento.citas
   */
  export type SubTratamiento$citasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    where?: CitaWhereInput
    orderBy?: CitaOrderByWithRelationInput | CitaOrderByWithRelationInput[]
    cursor?: CitaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CitaScalarFieldEnum | CitaScalarFieldEnum[]
  }

  /**
   * SubTratamiento without action
   */
  export type SubTratamientoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubTratamiento
     */
    select?: SubTratamientoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubTratamiento
     */
    omit?: SubTratamientoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubTratamientoInclude<ExtArgs> | null
  }


  /**
   * Model Cita
   */

  export type AggregateCita = {
    _count: CitaCountAggregateOutputType | null
    _avg: CitaAvgAggregateOutputType | null
    _sum: CitaSumAggregateOutputType | null
    _min: CitaMinAggregateOutputType | null
    _max: CitaMaxAggregateOutputType | null
  }

  export type CitaAvgAggregateOutputType = {
    boxId: number | null
    duracion: number | null
    precio: Decimal | null
    senia: Decimal | null
  }

  export type CitaSumAggregateOutputType = {
    boxId: number | null
    duracion: number | null
    precio: Decimal | null
    senia: Decimal | null
  }

  export type CitaMinAggregateOutputType = {
    id: string | null
    nombreCompleto: string | null
    dni: string | null
    whatsapp: string | null
    fecha: Date | null
    horaInicio: Date | null
    horaFin: Date | null
    boxId: number | null
    tratamientoId: string | null
    subTratamientoId: string | null
    color: string | null
    duracion: number | null
    precio: Decimal | null
    senia: Decimal | null
    observaciones: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CitaMaxAggregateOutputType = {
    id: string | null
    nombreCompleto: string | null
    dni: string | null
    whatsapp: string | null
    fecha: Date | null
    horaInicio: Date | null
    horaFin: Date | null
    boxId: number | null
    tratamientoId: string | null
    subTratamientoId: string | null
    color: string | null
    duracion: number | null
    precio: Decimal | null
    senia: Decimal | null
    observaciones: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CitaCountAggregateOutputType = {
    id: number
    nombreCompleto: number
    dni: number
    whatsapp: number
    fecha: number
    horaInicio: number
    horaFin: number
    boxId: number
    tratamientoId: number
    subTratamientoId: number
    color: number
    duracion: number
    precio: number
    senia: number
    observaciones: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CitaAvgAggregateInputType = {
    boxId?: true
    duracion?: true
    precio?: true
    senia?: true
  }

  export type CitaSumAggregateInputType = {
    boxId?: true
    duracion?: true
    precio?: true
    senia?: true
  }

  export type CitaMinAggregateInputType = {
    id?: true
    nombreCompleto?: true
    dni?: true
    whatsapp?: true
    fecha?: true
    horaInicio?: true
    horaFin?: true
    boxId?: true
    tratamientoId?: true
    subTratamientoId?: true
    color?: true
    duracion?: true
    precio?: true
    senia?: true
    observaciones?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CitaMaxAggregateInputType = {
    id?: true
    nombreCompleto?: true
    dni?: true
    whatsapp?: true
    fecha?: true
    horaInicio?: true
    horaFin?: true
    boxId?: true
    tratamientoId?: true
    subTratamientoId?: true
    color?: true
    duracion?: true
    precio?: true
    senia?: true
    observaciones?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CitaCountAggregateInputType = {
    id?: true
    nombreCompleto?: true
    dni?: true
    whatsapp?: true
    fecha?: true
    horaInicio?: true
    horaFin?: true
    boxId?: true
    tratamientoId?: true
    subTratamientoId?: true
    color?: true
    duracion?: true
    precio?: true
    senia?: true
    observaciones?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CitaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cita to aggregate.
     */
    where?: CitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citas to fetch.
     */
    orderBy?: CitaOrderByWithRelationInput | CitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Citas
    **/
    _count?: true | CitaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CitaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CitaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CitaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CitaMaxAggregateInputType
  }

  export type GetCitaAggregateType<T extends CitaAggregateArgs> = {
        [P in keyof T & keyof AggregateCita]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCita[P]>
      : GetScalarType<T[P], AggregateCita[P]>
  }




  export type CitaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CitaWhereInput
    orderBy?: CitaOrderByWithAggregationInput | CitaOrderByWithAggregationInput[]
    by: CitaScalarFieldEnum[] | CitaScalarFieldEnum
    having?: CitaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CitaCountAggregateInputType | true
    _avg?: CitaAvgAggregateInputType
    _sum?: CitaSumAggregateInputType
    _min?: CitaMinAggregateInputType
    _max?: CitaMaxAggregateInputType
  }

  export type CitaGroupByOutputType = {
    id: string
    nombreCompleto: string
    dni: string | null
    whatsapp: string | null
    fecha: Date
    horaInicio: Date
    horaFin: Date
    boxId: number
    tratamientoId: string
    subTratamientoId: string
    color: string
    duracion: number | null
    precio: Decimal | null
    senia: Decimal
    observaciones: string | null
    createdAt: Date
    updatedAt: Date
    _count: CitaCountAggregateOutputType | null
    _avg: CitaAvgAggregateOutputType | null
    _sum: CitaSumAggregateOutputType | null
    _min: CitaMinAggregateOutputType | null
    _max: CitaMaxAggregateOutputType | null
  }

  type GetCitaGroupByPayload<T extends CitaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CitaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CitaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CitaGroupByOutputType[P]>
            : GetScalarType<T[P], CitaGroupByOutputType[P]>
        }
      >
    >


  export type CitaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreCompleto?: boolean
    dni?: boolean
    whatsapp?: boolean
    fecha?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    boxId?: boolean
    tratamientoId?: boolean
    subTratamientoId?: boolean
    color?: boolean
    duracion?: boolean
    precio?: boolean
    senia?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    subTratamiento?: boolean | SubTratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cita"]>

  export type CitaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreCompleto?: boolean
    dni?: boolean
    whatsapp?: boolean
    fecha?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    boxId?: boolean
    tratamientoId?: boolean
    subTratamientoId?: boolean
    color?: boolean
    duracion?: boolean
    precio?: boolean
    senia?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    subTratamiento?: boolean | SubTratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cita"]>

  export type CitaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreCompleto?: boolean
    dni?: boolean
    whatsapp?: boolean
    fecha?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    boxId?: boolean
    tratamientoId?: boolean
    subTratamientoId?: boolean
    color?: boolean
    duracion?: boolean
    precio?: boolean
    senia?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    subTratamiento?: boolean | SubTratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cita"]>

  export type CitaSelectScalar = {
    id?: boolean
    nombreCompleto?: boolean
    dni?: boolean
    whatsapp?: boolean
    fecha?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    boxId?: boolean
    tratamientoId?: boolean
    subTratamientoId?: boolean
    color?: boolean
    duracion?: boolean
    precio?: boolean
    senia?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CitaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombreCompleto" | "dni" | "whatsapp" | "fecha" | "horaInicio" | "horaFin" | "boxId" | "tratamientoId" | "subTratamientoId" | "color" | "duracion" | "precio" | "senia" | "observaciones" | "createdAt" | "updatedAt", ExtArgs["result"]["cita"]>
  export type CitaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    subTratamiento?: boolean | SubTratamientoDefaultArgs<ExtArgs>
  }
  export type CitaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    subTratamiento?: boolean | SubTratamientoDefaultArgs<ExtArgs>
  }
  export type CitaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
    subTratamiento?: boolean | SubTratamientoDefaultArgs<ExtArgs>
  }

  export type $CitaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cita"
    objects: {
      tratamiento: Prisma.$TratamientoPayload<ExtArgs>
      subTratamiento: Prisma.$SubTratamientoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombreCompleto: string
      dni: string | null
      whatsapp: string | null
      fecha: Date
      horaInicio: Date
      horaFin: Date
      boxId: number
      tratamientoId: string
      subTratamientoId: string
      color: string
      duracion: number | null
      precio: Prisma.Decimal | null
      senia: Prisma.Decimal
      observaciones: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cita"]>
    composites: {}
  }

  type CitaGetPayload<S extends boolean | null | undefined | CitaDefaultArgs> = $Result.GetResult<Prisma.$CitaPayload, S>

  type CitaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CitaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CitaCountAggregateInputType | true
    }

  export interface CitaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cita'], meta: { name: 'Cita' } }
    /**
     * Find zero or one Cita that matches the filter.
     * @param {CitaFindUniqueArgs} args - Arguments to find a Cita
     * @example
     * // Get one Cita
     * const cita = await prisma.cita.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CitaFindUniqueArgs>(args: SelectSubset<T, CitaFindUniqueArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cita that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CitaFindUniqueOrThrowArgs} args - Arguments to find a Cita
     * @example
     * // Get one Cita
     * const cita = await prisma.cita.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CitaFindUniqueOrThrowArgs>(args: SelectSubset<T, CitaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cita that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaFindFirstArgs} args - Arguments to find a Cita
     * @example
     * // Get one Cita
     * const cita = await prisma.cita.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CitaFindFirstArgs>(args?: SelectSubset<T, CitaFindFirstArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cita that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaFindFirstOrThrowArgs} args - Arguments to find a Cita
     * @example
     * // Get one Cita
     * const cita = await prisma.cita.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CitaFindFirstOrThrowArgs>(args?: SelectSubset<T, CitaFindFirstOrThrowArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Citas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Citas
     * const citas = await prisma.cita.findMany()
     * 
     * // Get first 10 Citas
     * const citas = await prisma.cita.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const citaWithIdOnly = await prisma.cita.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CitaFindManyArgs>(args?: SelectSubset<T, CitaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cita.
     * @param {CitaCreateArgs} args - Arguments to create a Cita.
     * @example
     * // Create one Cita
     * const Cita = await prisma.cita.create({
     *   data: {
     *     // ... data to create a Cita
     *   }
     * })
     * 
     */
    create<T extends CitaCreateArgs>(args: SelectSubset<T, CitaCreateArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Citas.
     * @param {CitaCreateManyArgs} args - Arguments to create many Citas.
     * @example
     * // Create many Citas
     * const cita = await prisma.cita.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CitaCreateManyArgs>(args?: SelectSubset<T, CitaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Citas and returns the data saved in the database.
     * @param {CitaCreateManyAndReturnArgs} args - Arguments to create many Citas.
     * @example
     * // Create many Citas
     * const cita = await prisma.cita.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Citas and only return the `id`
     * const citaWithIdOnly = await prisma.cita.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CitaCreateManyAndReturnArgs>(args?: SelectSubset<T, CitaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cita.
     * @param {CitaDeleteArgs} args - Arguments to delete one Cita.
     * @example
     * // Delete one Cita
     * const Cita = await prisma.cita.delete({
     *   where: {
     *     // ... filter to delete one Cita
     *   }
     * })
     * 
     */
    delete<T extends CitaDeleteArgs>(args: SelectSubset<T, CitaDeleteArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cita.
     * @param {CitaUpdateArgs} args - Arguments to update one Cita.
     * @example
     * // Update one Cita
     * const cita = await prisma.cita.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CitaUpdateArgs>(args: SelectSubset<T, CitaUpdateArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Citas.
     * @param {CitaDeleteManyArgs} args - Arguments to filter Citas to delete.
     * @example
     * // Delete a few Citas
     * const { count } = await prisma.cita.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CitaDeleteManyArgs>(args?: SelectSubset<T, CitaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Citas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Citas
     * const cita = await prisma.cita.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CitaUpdateManyArgs>(args: SelectSubset<T, CitaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Citas and returns the data updated in the database.
     * @param {CitaUpdateManyAndReturnArgs} args - Arguments to update many Citas.
     * @example
     * // Update many Citas
     * const cita = await prisma.cita.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Citas and only return the `id`
     * const citaWithIdOnly = await prisma.cita.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CitaUpdateManyAndReturnArgs>(args: SelectSubset<T, CitaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cita.
     * @param {CitaUpsertArgs} args - Arguments to update or create a Cita.
     * @example
     * // Update or create a Cita
     * const cita = await prisma.cita.upsert({
     *   create: {
     *     // ... data to create a Cita
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cita we want to update
     *   }
     * })
     */
    upsert<T extends CitaUpsertArgs>(args: SelectSubset<T, CitaUpsertArgs<ExtArgs>>): Prisma__CitaClient<$Result.GetResult<Prisma.$CitaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Citas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaCountArgs} args - Arguments to filter Citas to count.
     * @example
     * // Count the number of Citas
     * const count = await prisma.cita.count({
     *   where: {
     *     // ... the filter for the Citas we want to count
     *   }
     * })
    **/
    count<T extends CitaCountArgs>(
      args?: Subset<T, CitaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CitaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CitaAggregateArgs>(args: Subset<T, CitaAggregateArgs>): Prisma.PrismaPromise<GetCitaAggregateType<T>>

    /**
     * Group by Cita.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CitaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CitaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CitaGroupByArgs['orderBy'] }
        : { orderBy?: CitaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CitaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCitaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cita model
   */
  readonly fields: CitaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cita.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CitaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tratamiento<T extends TratamientoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TratamientoDefaultArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    subTratamiento<T extends SubTratamientoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SubTratamientoDefaultArgs<ExtArgs>>): Prisma__SubTratamientoClient<$Result.GetResult<Prisma.$SubTratamientoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cita model
   */
  interface CitaFieldRefs {
    readonly id: FieldRef<"Cita", 'String'>
    readonly nombreCompleto: FieldRef<"Cita", 'String'>
    readonly dni: FieldRef<"Cita", 'String'>
    readonly whatsapp: FieldRef<"Cita", 'String'>
    readonly fecha: FieldRef<"Cita", 'DateTime'>
    readonly horaInicio: FieldRef<"Cita", 'DateTime'>
    readonly horaFin: FieldRef<"Cita", 'DateTime'>
    readonly boxId: FieldRef<"Cita", 'Int'>
    readonly tratamientoId: FieldRef<"Cita", 'String'>
    readonly subTratamientoId: FieldRef<"Cita", 'String'>
    readonly color: FieldRef<"Cita", 'String'>
    readonly duracion: FieldRef<"Cita", 'Int'>
    readonly precio: FieldRef<"Cita", 'Decimal'>
    readonly senia: FieldRef<"Cita", 'Decimal'>
    readonly observaciones: FieldRef<"Cita", 'String'>
    readonly createdAt: FieldRef<"Cita", 'DateTime'>
    readonly updatedAt: FieldRef<"Cita", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cita findUnique
   */
  export type CitaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * Filter, which Cita to fetch.
     */
    where: CitaWhereUniqueInput
  }

  /**
   * Cita findUniqueOrThrow
   */
  export type CitaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * Filter, which Cita to fetch.
     */
    where: CitaWhereUniqueInput
  }

  /**
   * Cita findFirst
   */
  export type CitaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * Filter, which Cita to fetch.
     */
    where?: CitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citas to fetch.
     */
    orderBy?: CitaOrderByWithRelationInput | CitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Citas.
     */
    cursor?: CitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Citas.
     */
    distinct?: CitaScalarFieldEnum | CitaScalarFieldEnum[]
  }

  /**
   * Cita findFirstOrThrow
   */
  export type CitaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * Filter, which Cita to fetch.
     */
    where?: CitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citas to fetch.
     */
    orderBy?: CitaOrderByWithRelationInput | CitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Citas.
     */
    cursor?: CitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Citas.
     */
    distinct?: CitaScalarFieldEnum | CitaScalarFieldEnum[]
  }

  /**
   * Cita findMany
   */
  export type CitaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * Filter, which Citas to fetch.
     */
    where?: CitaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Citas to fetch.
     */
    orderBy?: CitaOrderByWithRelationInput | CitaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Citas.
     */
    cursor?: CitaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Citas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Citas.
     */
    skip?: number
    distinct?: CitaScalarFieldEnum | CitaScalarFieldEnum[]
  }

  /**
   * Cita create
   */
  export type CitaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * The data needed to create a Cita.
     */
    data: XOR<CitaCreateInput, CitaUncheckedCreateInput>
  }

  /**
   * Cita createMany
   */
  export type CitaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Citas.
     */
    data: CitaCreateManyInput | CitaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cita createManyAndReturn
   */
  export type CitaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * The data used to create many Citas.
     */
    data: CitaCreateManyInput | CitaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cita update
   */
  export type CitaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * The data needed to update a Cita.
     */
    data: XOR<CitaUpdateInput, CitaUncheckedUpdateInput>
    /**
     * Choose, which Cita to update.
     */
    where: CitaWhereUniqueInput
  }

  /**
   * Cita updateMany
   */
  export type CitaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Citas.
     */
    data: XOR<CitaUpdateManyMutationInput, CitaUncheckedUpdateManyInput>
    /**
     * Filter which Citas to update
     */
    where?: CitaWhereInput
    /**
     * Limit how many Citas to update.
     */
    limit?: number
  }

  /**
   * Cita updateManyAndReturn
   */
  export type CitaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * The data used to update Citas.
     */
    data: XOR<CitaUpdateManyMutationInput, CitaUncheckedUpdateManyInput>
    /**
     * Filter which Citas to update
     */
    where?: CitaWhereInput
    /**
     * Limit how many Citas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cita upsert
   */
  export type CitaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * The filter to search for the Cita to update in case it exists.
     */
    where: CitaWhereUniqueInput
    /**
     * In case the Cita found by the `where` argument doesn't exist, create a new Cita with this data.
     */
    create: XOR<CitaCreateInput, CitaUncheckedCreateInput>
    /**
     * In case the Cita was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CitaUpdateInput, CitaUncheckedUpdateInput>
  }

  /**
   * Cita delete
   */
  export type CitaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
    /**
     * Filter which Cita to delete.
     */
    where: CitaWhereUniqueInput
  }

  /**
   * Cita deleteMany
   */
  export type CitaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Citas to delete
     */
    where?: CitaWhereInput
    /**
     * Limit how many Citas to delete.
     */
    limit?: number
  }

  /**
   * Cita without action
   */
  export type CitaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cita
     */
    select?: CitaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cita
     */
    omit?: CitaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CitaInclude<ExtArgs> | null
  }


  /**
   * Model FechaDisponible
   */

  export type AggregateFechaDisponible = {
    _count: FechaDisponibleCountAggregateOutputType | null
    _avg: FechaDisponibleAvgAggregateOutputType | null
    _sum: FechaDisponibleSumAggregateOutputType | null
    _min: FechaDisponibleMinAggregateOutputType | null
    _max: FechaDisponibleMaxAggregateOutputType | null
  }

  export type FechaDisponibleAvgAggregateOutputType = {
    boxesDisponibles: number | null
  }

  export type FechaDisponibleSumAggregateOutputType = {
    boxesDisponibles: number[]
  }

  export type FechaDisponibleMinAggregateOutputType = {
    id: string | null
    tratamientoId: string | null
    fechaInicio: Date | null
    fechaFin: Date | null
    horaInicio: Date | null
    horaFin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FechaDisponibleMaxAggregateOutputType = {
    id: string | null
    tratamientoId: string | null
    fechaInicio: Date | null
    fechaFin: Date | null
    horaInicio: Date | null
    horaFin: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FechaDisponibleCountAggregateOutputType = {
    id: number
    tratamientoId: number
    fechaInicio: number
    fechaFin: number
    boxesDisponibles: number
    horaInicio: number
    horaFin: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FechaDisponibleAvgAggregateInputType = {
    boxesDisponibles?: true
  }

  export type FechaDisponibleSumAggregateInputType = {
    boxesDisponibles?: true
  }

  export type FechaDisponibleMinAggregateInputType = {
    id?: true
    tratamientoId?: true
    fechaInicio?: true
    fechaFin?: true
    horaInicio?: true
    horaFin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FechaDisponibleMaxAggregateInputType = {
    id?: true
    tratamientoId?: true
    fechaInicio?: true
    fechaFin?: true
    horaInicio?: true
    horaFin?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FechaDisponibleCountAggregateInputType = {
    id?: true
    tratamientoId?: true
    fechaInicio?: true
    fechaFin?: true
    boxesDisponibles?: true
    horaInicio?: true
    horaFin?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FechaDisponibleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FechaDisponible to aggregate.
     */
    where?: FechaDisponibleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FechaDisponibles to fetch.
     */
    orderBy?: FechaDisponibleOrderByWithRelationInput | FechaDisponibleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FechaDisponibleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FechaDisponibles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FechaDisponibles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FechaDisponibles
    **/
    _count?: true | FechaDisponibleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FechaDisponibleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FechaDisponibleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FechaDisponibleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FechaDisponibleMaxAggregateInputType
  }

  export type GetFechaDisponibleAggregateType<T extends FechaDisponibleAggregateArgs> = {
        [P in keyof T & keyof AggregateFechaDisponible]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFechaDisponible[P]>
      : GetScalarType<T[P], AggregateFechaDisponible[P]>
  }




  export type FechaDisponibleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FechaDisponibleWhereInput
    orderBy?: FechaDisponibleOrderByWithAggregationInput | FechaDisponibleOrderByWithAggregationInput[]
    by: FechaDisponibleScalarFieldEnum[] | FechaDisponibleScalarFieldEnum
    having?: FechaDisponibleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FechaDisponibleCountAggregateInputType | true
    _avg?: FechaDisponibleAvgAggregateInputType
    _sum?: FechaDisponibleSumAggregateInputType
    _min?: FechaDisponibleMinAggregateInputType
    _max?: FechaDisponibleMaxAggregateInputType
  }

  export type FechaDisponibleGroupByOutputType = {
    id: string
    tratamientoId: string
    fechaInicio: Date
    fechaFin: Date
    boxesDisponibles: number[]
    horaInicio: Date
    horaFin: Date
    createdAt: Date
    updatedAt: Date
    _count: FechaDisponibleCountAggregateOutputType | null
    _avg: FechaDisponibleAvgAggregateOutputType | null
    _sum: FechaDisponibleSumAggregateOutputType | null
    _min: FechaDisponibleMinAggregateOutputType | null
    _max: FechaDisponibleMaxAggregateOutputType | null
  }

  type GetFechaDisponibleGroupByPayload<T extends FechaDisponibleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FechaDisponibleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FechaDisponibleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FechaDisponibleGroupByOutputType[P]>
            : GetScalarType<T[P], FechaDisponibleGroupByOutputType[P]>
        }
      >
    >


  export type FechaDisponibleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tratamientoId?: boolean
    fechaInicio?: boolean
    fechaFin?: boolean
    boxesDisponibles?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fechaDisponible"]>

  export type FechaDisponibleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tratamientoId?: boolean
    fechaInicio?: boolean
    fechaFin?: boolean
    boxesDisponibles?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fechaDisponible"]>

  export type FechaDisponibleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tratamientoId?: boolean
    fechaInicio?: boolean
    fechaFin?: boolean
    boxesDisponibles?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fechaDisponible"]>

  export type FechaDisponibleSelectScalar = {
    id?: boolean
    tratamientoId?: boolean
    fechaInicio?: boolean
    fechaFin?: boolean
    boxesDisponibles?: boolean
    horaInicio?: boolean
    horaFin?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FechaDisponibleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tratamientoId" | "fechaInicio" | "fechaFin" | "boxesDisponibles" | "horaInicio" | "horaFin" | "createdAt" | "updatedAt", ExtArgs["result"]["fechaDisponible"]>
  export type FechaDisponibleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }
  export type FechaDisponibleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }
  export type FechaDisponibleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tratamiento?: boolean | TratamientoDefaultArgs<ExtArgs>
  }

  export type $FechaDisponiblePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FechaDisponible"
    objects: {
      tratamiento: Prisma.$TratamientoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tratamientoId: string
      fechaInicio: Date
      fechaFin: Date
      boxesDisponibles: number[]
      horaInicio: Date
      horaFin: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["fechaDisponible"]>
    composites: {}
  }

  type FechaDisponibleGetPayload<S extends boolean | null | undefined | FechaDisponibleDefaultArgs> = $Result.GetResult<Prisma.$FechaDisponiblePayload, S>

  type FechaDisponibleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FechaDisponibleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FechaDisponibleCountAggregateInputType | true
    }

  export interface FechaDisponibleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FechaDisponible'], meta: { name: 'FechaDisponible' } }
    /**
     * Find zero or one FechaDisponible that matches the filter.
     * @param {FechaDisponibleFindUniqueArgs} args - Arguments to find a FechaDisponible
     * @example
     * // Get one FechaDisponible
     * const fechaDisponible = await prisma.fechaDisponible.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FechaDisponibleFindUniqueArgs>(args: SelectSubset<T, FechaDisponibleFindUniqueArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FechaDisponible that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FechaDisponibleFindUniqueOrThrowArgs} args - Arguments to find a FechaDisponible
     * @example
     * // Get one FechaDisponible
     * const fechaDisponible = await prisma.fechaDisponible.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FechaDisponibleFindUniqueOrThrowArgs>(args: SelectSubset<T, FechaDisponibleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FechaDisponible that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleFindFirstArgs} args - Arguments to find a FechaDisponible
     * @example
     * // Get one FechaDisponible
     * const fechaDisponible = await prisma.fechaDisponible.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FechaDisponibleFindFirstArgs>(args?: SelectSubset<T, FechaDisponibleFindFirstArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FechaDisponible that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleFindFirstOrThrowArgs} args - Arguments to find a FechaDisponible
     * @example
     * // Get one FechaDisponible
     * const fechaDisponible = await prisma.fechaDisponible.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FechaDisponibleFindFirstOrThrowArgs>(args?: SelectSubset<T, FechaDisponibleFindFirstOrThrowArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FechaDisponibles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FechaDisponibles
     * const fechaDisponibles = await prisma.fechaDisponible.findMany()
     * 
     * // Get first 10 FechaDisponibles
     * const fechaDisponibles = await prisma.fechaDisponible.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fechaDisponibleWithIdOnly = await prisma.fechaDisponible.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FechaDisponibleFindManyArgs>(args?: SelectSubset<T, FechaDisponibleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FechaDisponible.
     * @param {FechaDisponibleCreateArgs} args - Arguments to create a FechaDisponible.
     * @example
     * // Create one FechaDisponible
     * const FechaDisponible = await prisma.fechaDisponible.create({
     *   data: {
     *     // ... data to create a FechaDisponible
     *   }
     * })
     * 
     */
    create<T extends FechaDisponibleCreateArgs>(args: SelectSubset<T, FechaDisponibleCreateArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FechaDisponibles.
     * @param {FechaDisponibleCreateManyArgs} args - Arguments to create many FechaDisponibles.
     * @example
     * // Create many FechaDisponibles
     * const fechaDisponible = await prisma.fechaDisponible.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FechaDisponibleCreateManyArgs>(args?: SelectSubset<T, FechaDisponibleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FechaDisponibles and returns the data saved in the database.
     * @param {FechaDisponibleCreateManyAndReturnArgs} args - Arguments to create many FechaDisponibles.
     * @example
     * // Create many FechaDisponibles
     * const fechaDisponible = await prisma.fechaDisponible.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FechaDisponibles and only return the `id`
     * const fechaDisponibleWithIdOnly = await prisma.fechaDisponible.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FechaDisponibleCreateManyAndReturnArgs>(args?: SelectSubset<T, FechaDisponibleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FechaDisponible.
     * @param {FechaDisponibleDeleteArgs} args - Arguments to delete one FechaDisponible.
     * @example
     * // Delete one FechaDisponible
     * const FechaDisponible = await prisma.fechaDisponible.delete({
     *   where: {
     *     // ... filter to delete one FechaDisponible
     *   }
     * })
     * 
     */
    delete<T extends FechaDisponibleDeleteArgs>(args: SelectSubset<T, FechaDisponibleDeleteArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FechaDisponible.
     * @param {FechaDisponibleUpdateArgs} args - Arguments to update one FechaDisponible.
     * @example
     * // Update one FechaDisponible
     * const fechaDisponible = await prisma.fechaDisponible.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FechaDisponibleUpdateArgs>(args: SelectSubset<T, FechaDisponibleUpdateArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FechaDisponibles.
     * @param {FechaDisponibleDeleteManyArgs} args - Arguments to filter FechaDisponibles to delete.
     * @example
     * // Delete a few FechaDisponibles
     * const { count } = await prisma.fechaDisponible.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FechaDisponibleDeleteManyArgs>(args?: SelectSubset<T, FechaDisponibleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FechaDisponibles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FechaDisponibles
     * const fechaDisponible = await prisma.fechaDisponible.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FechaDisponibleUpdateManyArgs>(args: SelectSubset<T, FechaDisponibleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FechaDisponibles and returns the data updated in the database.
     * @param {FechaDisponibleUpdateManyAndReturnArgs} args - Arguments to update many FechaDisponibles.
     * @example
     * // Update many FechaDisponibles
     * const fechaDisponible = await prisma.fechaDisponible.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FechaDisponibles and only return the `id`
     * const fechaDisponibleWithIdOnly = await prisma.fechaDisponible.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FechaDisponibleUpdateManyAndReturnArgs>(args: SelectSubset<T, FechaDisponibleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FechaDisponible.
     * @param {FechaDisponibleUpsertArgs} args - Arguments to update or create a FechaDisponible.
     * @example
     * // Update or create a FechaDisponible
     * const fechaDisponible = await prisma.fechaDisponible.upsert({
     *   create: {
     *     // ... data to create a FechaDisponible
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FechaDisponible we want to update
     *   }
     * })
     */
    upsert<T extends FechaDisponibleUpsertArgs>(args: SelectSubset<T, FechaDisponibleUpsertArgs<ExtArgs>>): Prisma__FechaDisponibleClient<$Result.GetResult<Prisma.$FechaDisponiblePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FechaDisponibles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleCountArgs} args - Arguments to filter FechaDisponibles to count.
     * @example
     * // Count the number of FechaDisponibles
     * const count = await prisma.fechaDisponible.count({
     *   where: {
     *     // ... the filter for the FechaDisponibles we want to count
     *   }
     * })
    **/
    count<T extends FechaDisponibleCountArgs>(
      args?: Subset<T, FechaDisponibleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FechaDisponibleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FechaDisponible.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FechaDisponibleAggregateArgs>(args: Subset<T, FechaDisponibleAggregateArgs>): Prisma.PrismaPromise<GetFechaDisponibleAggregateType<T>>

    /**
     * Group by FechaDisponible.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FechaDisponibleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FechaDisponibleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FechaDisponibleGroupByArgs['orderBy'] }
        : { orderBy?: FechaDisponibleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FechaDisponibleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFechaDisponibleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FechaDisponible model
   */
  readonly fields: FechaDisponibleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FechaDisponible.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FechaDisponibleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tratamiento<T extends TratamientoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TratamientoDefaultArgs<ExtArgs>>): Prisma__TratamientoClient<$Result.GetResult<Prisma.$TratamientoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FechaDisponible model
   */
  interface FechaDisponibleFieldRefs {
    readonly id: FieldRef<"FechaDisponible", 'String'>
    readonly tratamientoId: FieldRef<"FechaDisponible", 'String'>
    readonly fechaInicio: FieldRef<"FechaDisponible", 'DateTime'>
    readonly fechaFin: FieldRef<"FechaDisponible", 'DateTime'>
    readonly boxesDisponibles: FieldRef<"FechaDisponible", 'Int[]'>
    readonly horaInicio: FieldRef<"FechaDisponible", 'DateTime'>
    readonly horaFin: FieldRef<"FechaDisponible", 'DateTime'>
    readonly createdAt: FieldRef<"FechaDisponible", 'DateTime'>
    readonly updatedAt: FieldRef<"FechaDisponible", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FechaDisponible findUnique
   */
  export type FechaDisponibleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * Filter, which FechaDisponible to fetch.
     */
    where: FechaDisponibleWhereUniqueInput
  }

  /**
   * FechaDisponible findUniqueOrThrow
   */
  export type FechaDisponibleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * Filter, which FechaDisponible to fetch.
     */
    where: FechaDisponibleWhereUniqueInput
  }

  /**
   * FechaDisponible findFirst
   */
  export type FechaDisponibleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * Filter, which FechaDisponible to fetch.
     */
    where?: FechaDisponibleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FechaDisponibles to fetch.
     */
    orderBy?: FechaDisponibleOrderByWithRelationInput | FechaDisponibleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FechaDisponibles.
     */
    cursor?: FechaDisponibleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FechaDisponibles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FechaDisponibles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FechaDisponibles.
     */
    distinct?: FechaDisponibleScalarFieldEnum | FechaDisponibleScalarFieldEnum[]
  }

  /**
   * FechaDisponible findFirstOrThrow
   */
  export type FechaDisponibleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * Filter, which FechaDisponible to fetch.
     */
    where?: FechaDisponibleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FechaDisponibles to fetch.
     */
    orderBy?: FechaDisponibleOrderByWithRelationInput | FechaDisponibleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FechaDisponibles.
     */
    cursor?: FechaDisponibleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FechaDisponibles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FechaDisponibles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FechaDisponibles.
     */
    distinct?: FechaDisponibleScalarFieldEnum | FechaDisponibleScalarFieldEnum[]
  }

  /**
   * FechaDisponible findMany
   */
  export type FechaDisponibleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * Filter, which FechaDisponibles to fetch.
     */
    where?: FechaDisponibleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FechaDisponibles to fetch.
     */
    orderBy?: FechaDisponibleOrderByWithRelationInput | FechaDisponibleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FechaDisponibles.
     */
    cursor?: FechaDisponibleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FechaDisponibles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FechaDisponibles.
     */
    skip?: number
    distinct?: FechaDisponibleScalarFieldEnum | FechaDisponibleScalarFieldEnum[]
  }

  /**
   * FechaDisponible create
   */
  export type FechaDisponibleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * The data needed to create a FechaDisponible.
     */
    data: XOR<FechaDisponibleCreateInput, FechaDisponibleUncheckedCreateInput>
  }

  /**
   * FechaDisponible createMany
   */
  export type FechaDisponibleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FechaDisponibles.
     */
    data: FechaDisponibleCreateManyInput | FechaDisponibleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FechaDisponible createManyAndReturn
   */
  export type FechaDisponibleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * The data used to create many FechaDisponibles.
     */
    data: FechaDisponibleCreateManyInput | FechaDisponibleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FechaDisponible update
   */
  export type FechaDisponibleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * The data needed to update a FechaDisponible.
     */
    data: XOR<FechaDisponibleUpdateInput, FechaDisponibleUncheckedUpdateInput>
    /**
     * Choose, which FechaDisponible to update.
     */
    where: FechaDisponibleWhereUniqueInput
  }

  /**
   * FechaDisponible updateMany
   */
  export type FechaDisponibleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FechaDisponibles.
     */
    data: XOR<FechaDisponibleUpdateManyMutationInput, FechaDisponibleUncheckedUpdateManyInput>
    /**
     * Filter which FechaDisponibles to update
     */
    where?: FechaDisponibleWhereInput
    /**
     * Limit how many FechaDisponibles to update.
     */
    limit?: number
  }

  /**
   * FechaDisponible updateManyAndReturn
   */
  export type FechaDisponibleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * The data used to update FechaDisponibles.
     */
    data: XOR<FechaDisponibleUpdateManyMutationInput, FechaDisponibleUncheckedUpdateManyInput>
    /**
     * Filter which FechaDisponibles to update
     */
    where?: FechaDisponibleWhereInput
    /**
     * Limit how many FechaDisponibles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FechaDisponible upsert
   */
  export type FechaDisponibleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * The filter to search for the FechaDisponible to update in case it exists.
     */
    where: FechaDisponibleWhereUniqueInput
    /**
     * In case the FechaDisponible found by the `where` argument doesn't exist, create a new FechaDisponible with this data.
     */
    create: XOR<FechaDisponibleCreateInput, FechaDisponibleUncheckedCreateInput>
    /**
     * In case the FechaDisponible was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FechaDisponibleUpdateInput, FechaDisponibleUncheckedUpdateInput>
  }

  /**
   * FechaDisponible delete
   */
  export type FechaDisponibleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
    /**
     * Filter which FechaDisponible to delete.
     */
    where: FechaDisponibleWhereUniqueInput
  }

  /**
   * FechaDisponible deleteMany
   */
  export type FechaDisponibleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FechaDisponibles to delete
     */
    where?: FechaDisponibleWhereInput
    /**
     * Limit how many FechaDisponibles to delete.
     */
    limit?: number
  }

  /**
   * FechaDisponible without action
   */
  export type FechaDisponibleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FechaDisponible
     */
    select?: FechaDisponibleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FechaDisponible
     */
    omit?: FechaDisponibleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FechaDisponibleInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TratamientoScalarFieldEnum: {
    id: 'id',
    nombre: 'nombre',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TratamientoScalarFieldEnum = (typeof TratamientoScalarFieldEnum)[keyof typeof TratamientoScalarFieldEnum]


  export const SubTratamientoScalarFieldEnum: {
    id: 'id',
    tratamientoId: 'tratamientoId',
    nombre: 'nombre',
    duracion: 'duracion',
    precio: 'precio',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SubTratamientoScalarFieldEnum = (typeof SubTratamientoScalarFieldEnum)[keyof typeof SubTratamientoScalarFieldEnum]


  export const CitaScalarFieldEnum: {
    id: 'id',
    nombreCompleto: 'nombreCompleto',
    dni: 'dni',
    whatsapp: 'whatsapp',
    fecha: 'fecha',
    horaInicio: 'horaInicio',
    horaFin: 'horaFin',
    boxId: 'boxId',
    tratamientoId: 'tratamientoId',
    subTratamientoId: 'subTratamientoId',
    color: 'color',
    duracion: 'duracion',
    precio: 'precio',
    senia: 'senia',
    observaciones: 'observaciones',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CitaScalarFieldEnum = (typeof CitaScalarFieldEnum)[keyof typeof CitaScalarFieldEnum]


  export const FechaDisponibleScalarFieldEnum: {
    id: 'id',
    tratamientoId: 'tratamientoId',
    fechaInicio: 'fechaInicio',
    fechaFin: 'fechaFin',
    boxesDisponibles: 'boxesDisponibles',
    horaInicio: 'horaInicio',
    horaFin: 'horaFin',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FechaDisponibleScalarFieldEnum = (typeof FechaDisponibleScalarFieldEnum)[keyof typeof FechaDisponibleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TratamientoWhereInput = {
    AND?: TratamientoWhereInput | TratamientoWhereInput[]
    OR?: TratamientoWhereInput[]
    NOT?: TratamientoWhereInput | TratamientoWhereInput[]
    id?: UuidFilter<"Tratamiento"> | string
    nombre?: StringFilter<"Tratamiento"> | string
    createdAt?: DateTimeFilter<"Tratamiento"> | Date | string
    updatedAt?: DateTimeFilter<"Tratamiento"> | Date | string
    subTratamientos?: SubTratamientoListRelationFilter
    citas?: CitaListRelationFilter
    fechasDisponibles?: FechaDisponibleListRelationFilter
  }

  export type TratamientoOrderByWithRelationInput = {
    id?: SortOrder
    nombre?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    subTratamientos?: SubTratamientoOrderByRelationAggregateInput
    citas?: CitaOrderByRelationAggregateInput
    fechasDisponibles?: FechaDisponibleOrderByRelationAggregateInput
  }

  export type TratamientoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    nombre?: string
    AND?: TratamientoWhereInput | TratamientoWhereInput[]
    OR?: TratamientoWhereInput[]
    NOT?: TratamientoWhereInput | TratamientoWhereInput[]
    createdAt?: DateTimeFilter<"Tratamiento"> | Date | string
    updatedAt?: DateTimeFilter<"Tratamiento"> | Date | string
    subTratamientos?: SubTratamientoListRelationFilter
    citas?: CitaListRelationFilter
    fechasDisponibles?: FechaDisponibleListRelationFilter
  }, "id" | "nombre">

  export type TratamientoOrderByWithAggregationInput = {
    id?: SortOrder
    nombre?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TratamientoCountOrderByAggregateInput
    _max?: TratamientoMaxOrderByAggregateInput
    _min?: TratamientoMinOrderByAggregateInput
  }

  export type TratamientoScalarWhereWithAggregatesInput = {
    AND?: TratamientoScalarWhereWithAggregatesInput | TratamientoScalarWhereWithAggregatesInput[]
    OR?: TratamientoScalarWhereWithAggregatesInput[]
    NOT?: TratamientoScalarWhereWithAggregatesInput | TratamientoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Tratamiento"> | string
    nombre?: StringWithAggregatesFilter<"Tratamiento"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tratamiento"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tratamiento"> | Date | string
  }

  export type SubTratamientoWhereInput = {
    AND?: SubTratamientoWhereInput | SubTratamientoWhereInput[]
    OR?: SubTratamientoWhereInput[]
    NOT?: SubTratamientoWhereInput | SubTratamientoWhereInput[]
    id?: UuidFilter<"SubTratamiento"> | string
    tratamientoId?: UuidFilter<"SubTratamiento"> | string
    nombre?: StringFilter<"SubTratamiento"> | string
    duracion?: IntFilter<"SubTratamiento"> | number
    precio?: DecimalFilter<"SubTratamiento"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"SubTratamiento"> | Date | string
    updatedAt?: DateTimeFilter<"SubTratamiento"> | Date | string
    tratamiento?: XOR<TratamientoScalarRelationFilter, TratamientoWhereInput>
    citas?: CitaListRelationFilter
  }

  export type SubTratamientoOrderByWithRelationInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    nombre?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tratamiento?: TratamientoOrderByWithRelationInput
    citas?: CitaOrderByRelationAggregateInput
  }

  export type SubTratamientoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tratamientoId_nombre?: SubTratamientoTratamientoIdNombreCompoundUniqueInput
    AND?: SubTratamientoWhereInput | SubTratamientoWhereInput[]
    OR?: SubTratamientoWhereInput[]
    NOT?: SubTratamientoWhereInput | SubTratamientoWhereInput[]
    tratamientoId?: UuidFilter<"SubTratamiento"> | string
    nombre?: StringFilter<"SubTratamiento"> | string
    duracion?: IntFilter<"SubTratamiento"> | number
    precio?: DecimalFilter<"SubTratamiento"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"SubTratamiento"> | Date | string
    updatedAt?: DateTimeFilter<"SubTratamiento"> | Date | string
    tratamiento?: XOR<TratamientoScalarRelationFilter, TratamientoWhereInput>
    citas?: CitaListRelationFilter
  }, "id" | "tratamientoId_nombre">

  export type SubTratamientoOrderByWithAggregationInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    nombre?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SubTratamientoCountOrderByAggregateInput
    _avg?: SubTratamientoAvgOrderByAggregateInput
    _max?: SubTratamientoMaxOrderByAggregateInput
    _min?: SubTratamientoMinOrderByAggregateInput
    _sum?: SubTratamientoSumOrderByAggregateInput
  }

  export type SubTratamientoScalarWhereWithAggregatesInput = {
    AND?: SubTratamientoScalarWhereWithAggregatesInput | SubTratamientoScalarWhereWithAggregatesInput[]
    OR?: SubTratamientoScalarWhereWithAggregatesInput[]
    NOT?: SubTratamientoScalarWhereWithAggregatesInput | SubTratamientoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SubTratamiento"> | string
    tratamientoId?: UuidWithAggregatesFilter<"SubTratamiento"> | string
    nombre?: StringWithAggregatesFilter<"SubTratamiento"> | string
    duracion?: IntWithAggregatesFilter<"SubTratamiento"> | number
    precio?: DecimalWithAggregatesFilter<"SubTratamiento"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeWithAggregatesFilter<"SubTratamiento"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SubTratamiento"> | Date | string
  }

  export type CitaWhereInput = {
    AND?: CitaWhereInput | CitaWhereInput[]
    OR?: CitaWhereInput[]
    NOT?: CitaWhereInput | CitaWhereInput[]
    id?: UuidFilter<"Cita"> | string
    nombreCompleto?: StringFilter<"Cita"> | string
    dni?: StringNullableFilter<"Cita"> | string | null
    whatsapp?: StringNullableFilter<"Cita"> | string | null
    fecha?: DateTimeFilter<"Cita"> | Date | string
    horaInicio?: DateTimeFilter<"Cita"> | Date | string
    horaFin?: DateTimeFilter<"Cita"> | Date | string
    boxId?: IntFilter<"Cita"> | number
    tratamientoId?: UuidFilter<"Cita"> | string
    subTratamientoId?: UuidFilter<"Cita"> | string
    color?: StringFilter<"Cita"> | string
    duracion?: IntNullableFilter<"Cita"> | number | null
    precio?: DecimalNullableFilter<"Cita"> | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFilter<"Cita"> | Decimal | DecimalJsLike | number | string
    observaciones?: StringNullableFilter<"Cita"> | string | null
    createdAt?: DateTimeFilter<"Cita"> | Date | string
    updatedAt?: DateTimeFilter<"Cita"> | Date | string
    tratamiento?: XOR<TratamientoScalarRelationFilter, TratamientoWhereInput>
    subTratamiento?: XOR<SubTratamientoScalarRelationFilter, SubTratamientoWhereInput>
  }

  export type CitaOrderByWithRelationInput = {
    id?: SortOrder
    nombreCompleto?: SortOrder
    dni?: SortOrderInput | SortOrder
    whatsapp?: SortOrderInput | SortOrder
    fecha?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    boxId?: SortOrder
    tratamientoId?: SortOrder
    subTratamientoId?: SortOrder
    color?: SortOrder
    duracion?: SortOrderInput | SortOrder
    precio?: SortOrderInput | SortOrder
    senia?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tratamiento?: TratamientoOrderByWithRelationInput
    subTratamiento?: SubTratamientoOrderByWithRelationInput
  }

  export type CitaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CitaWhereInput | CitaWhereInput[]
    OR?: CitaWhereInput[]
    NOT?: CitaWhereInput | CitaWhereInput[]
    nombreCompleto?: StringFilter<"Cita"> | string
    dni?: StringNullableFilter<"Cita"> | string | null
    whatsapp?: StringNullableFilter<"Cita"> | string | null
    fecha?: DateTimeFilter<"Cita"> | Date | string
    horaInicio?: DateTimeFilter<"Cita"> | Date | string
    horaFin?: DateTimeFilter<"Cita"> | Date | string
    boxId?: IntFilter<"Cita"> | number
    tratamientoId?: UuidFilter<"Cita"> | string
    subTratamientoId?: UuidFilter<"Cita"> | string
    color?: StringFilter<"Cita"> | string
    duracion?: IntNullableFilter<"Cita"> | number | null
    precio?: DecimalNullableFilter<"Cita"> | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFilter<"Cita"> | Decimal | DecimalJsLike | number | string
    observaciones?: StringNullableFilter<"Cita"> | string | null
    createdAt?: DateTimeFilter<"Cita"> | Date | string
    updatedAt?: DateTimeFilter<"Cita"> | Date | string
    tratamiento?: XOR<TratamientoScalarRelationFilter, TratamientoWhereInput>
    subTratamiento?: XOR<SubTratamientoScalarRelationFilter, SubTratamientoWhereInput>
  }, "id">

  export type CitaOrderByWithAggregationInput = {
    id?: SortOrder
    nombreCompleto?: SortOrder
    dni?: SortOrderInput | SortOrder
    whatsapp?: SortOrderInput | SortOrder
    fecha?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    boxId?: SortOrder
    tratamientoId?: SortOrder
    subTratamientoId?: SortOrder
    color?: SortOrder
    duracion?: SortOrderInput | SortOrder
    precio?: SortOrderInput | SortOrder
    senia?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CitaCountOrderByAggregateInput
    _avg?: CitaAvgOrderByAggregateInput
    _max?: CitaMaxOrderByAggregateInput
    _min?: CitaMinOrderByAggregateInput
    _sum?: CitaSumOrderByAggregateInput
  }

  export type CitaScalarWhereWithAggregatesInput = {
    AND?: CitaScalarWhereWithAggregatesInput | CitaScalarWhereWithAggregatesInput[]
    OR?: CitaScalarWhereWithAggregatesInput[]
    NOT?: CitaScalarWhereWithAggregatesInput | CitaScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Cita"> | string
    nombreCompleto?: StringWithAggregatesFilter<"Cita"> | string
    dni?: StringNullableWithAggregatesFilter<"Cita"> | string | null
    whatsapp?: StringNullableWithAggregatesFilter<"Cita"> | string | null
    fecha?: DateTimeWithAggregatesFilter<"Cita"> | Date | string
    horaInicio?: DateTimeWithAggregatesFilter<"Cita"> | Date | string
    horaFin?: DateTimeWithAggregatesFilter<"Cita"> | Date | string
    boxId?: IntWithAggregatesFilter<"Cita"> | number
    tratamientoId?: UuidWithAggregatesFilter<"Cita"> | string
    subTratamientoId?: UuidWithAggregatesFilter<"Cita"> | string
    color?: StringWithAggregatesFilter<"Cita"> | string
    duracion?: IntNullableWithAggregatesFilter<"Cita"> | number | null
    precio?: DecimalNullableWithAggregatesFilter<"Cita"> | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalWithAggregatesFilter<"Cita"> | Decimal | DecimalJsLike | number | string
    observaciones?: StringNullableWithAggregatesFilter<"Cita"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Cita"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Cita"> | Date | string
  }

  export type FechaDisponibleWhereInput = {
    AND?: FechaDisponibleWhereInput | FechaDisponibleWhereInput[]
    OR?: FechaDisponibleWhereInput[]
    NOT?: FechaDisponibleWhereInput | FechaDisponibleWhereInput[]
    id?: UuidFilter<"FechaDisponible"> | string
    tratamientoId?: UuidFilter<"FechaDisponible"> | string
    fechaInicio?: DateTimeFilter<"FechaDisponible"> | Date | string
    fechaFin?: DateTimeFilter<"FechaDisponible"> | Date | string
    boxesDisponibles?: IntNullableListFilter<"FechaDisponible">
    horaInicio?: DateTimeFilter<"FechaDisponible"> | Date | string
    horaFin?: DateTimeFilter<"FechaDisponible"> | Date | string
    createdAt?: DateTimeFilter<"FechaDisponible"> | Date | string
    updatedAt?: DateTimeFilter<"FechaDisponible"> | Date | string
    tratamiento?: XOR<TratamientoScalarRelationFilter, TratamientoWhereInput>
  }

  export type FechaDisponibleOrderByWithRelationInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    fechaInicio?: SortOrder
    fechaFin?: SortOrder
    boxesDisponibles?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tratamiento?: TratamientoOrderByWithRelationInput
  }

  export type FechaDisponibleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FechaDisponibleWhereInput | FechaDisponibleWhereInput[]
    OR?: FechaDisponibleWhereInput[]
    NOT?: FechaDisponibleWhereInput | FechaDisponibleWhereInput[]
    tratamientoId?: UuidFilter<"FechaDisponible"> | string
    fechaInicio?: DateTimeFilter<"FechaDisponible"> | Date | string
    fechaFin?: DateTimeFilter<"FechaDisponible"> | Date | string
    boxesDisponibles?: IntNullableListFilter<"FechaDisponible">
    horaInicio?: DateTimeFilter<"FechaDisponible"> | Date | string
    horaFin?: DateTimeFilter<"FechaDisponible"> | Date | string
    createdAt?: DateTimeFilter<"FechaDisponible"> | Date | string
    updatedAt?: DateTimeFilter<"FechaDisponible"> | Date | string
    tratamiento?: XOR<TratamientoScalarRelationFilter, TratamientoWhereInput>
  }, "id">

  export type FechaDisponibleOrderByWithAggregationInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    fechaInicio?: SortOrder
    fechaFin?: SortOrder
    boxesDisponibles?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FechaDisponibleCountOrderByAggregateInput
    _avg?: FechaDisponibleAvgOrderByAggregateInput
    _max?: FechaDisponibleMaxOrderByAggregateInput
    _min?: FechaDisponibleMinOrderByAggregateInput
    _sum?: FechaDisponibleSumOrderByAggregateInput
  }

  export type FechaDisponibleScalarWhereWithAggregatesInput = {
    AND?: FechaDisponibleScalarWhereWithAggregatesInput | FechaDisponibleScalarWhereWithAggregatesInput[]
    OR?: FechaDisponibleScalarWhereWithAggregatesInput[]
    NOT?: FechaDisponibleScalarWhereWithAggregatesInput | FechaDisponibleScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"FechaDisponible"> | string
    tratamientoId?: UuidWithAggregatesFilter<"FechaDisponible"> | string
    fechaInicio?: DateTimeWithAggregatesFilter<"FechaDisponible"> | Date | string
    fechaFin?: DateTimeWithAggregatesFilter<"FechaDisponible"> | Date | string
    boxesDisponibles?: IntNullableListFilter<"FechaDisponible">
    horaInicio?: DateTimeWithAggregatesFilter<"FechaDisponible"> | Date | string
    horaFin?: DateTimeWithAggregatesFilter<"FechaDisponible"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"FechaDisponible"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FechaDisponible"> | Date | string
  }

  export type TratamientoCreateInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamientos?: SubTratamientoCreateNestedManyWithoutTratamientoInput
    citas?: CitaCreateNestedManyWithoutTratamientoInput
    fechasDisponibles?: FechaDisponibleCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoUncheckedCreateInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamientos?: SubTratamientoUncheckedCreateNestedManyWithoutTratamientoInput
    citas?: CitaUncheckedCreateNestedManyWithoutTratamientoInput
    fechasDisponibles?: FechaDisponibleUncheckedCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamientos?: SubTratamientoUpdateManyWithoutTratamientoNestedInput
    citas?: CitaUpdateManyWithoutTratamientoNestedInput
    fechasDisponibles?: FechaDisponibleUpdateManyWithoutTratamientoNestedInput
  }

  export type TratamientoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamientos?: SubTratamientoUncheckedUpdateManyWithoutTratamientoNestedInput
    citas?: CitaUncheckedUpdateManyWithoutTratamientoNestedInput
    fechasDisponibles?: FechaDisponibleUncheckedUpdateManyWithoutTratamientoNestedInput
  }

  export type TratamientoCreateManyInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TratamientoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TratamientoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubTratamientoCreateInput = {
    id?: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tratamiento: TratamientoCreateNestedOneWithoutSubTratamientosInput
    citas?: CitaCreateNestedManyWithoutSubTratamientoInput
  }

  export type SubTratamientoUncheckedCreateInput = {
    id?: string
    tratamientoId: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    citas?: CitaUncheckedCreateNestedManyWithoutSubTratamientoInput
  }

  export type SubTratamientoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tratamiento?: TratamientoUpdateOneRequiredWithoutSubTratamientosNestedInput
    citas?: CitaUpdateManyWithoutSubTratamientoNestedInput
  }

  export type SubTratamientoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tratamientoId?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citas?: CitaUncheckedUpdateManyWithoutSubTratamientoNestedInput
  }

  export type SubTratamientoCreateManyInput = {
    id?: string
    tratamientoId: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubTratamientoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubTratamientoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tratamientoId?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaCreateInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tratamiento: TratamientoCreateNestedOneWithoutCitasInput
    subTratamiento: SubTratamientoCreateNestedOneWithoutCitasInput
  }

  export type CitaUncheckedCreateInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    tratamientoId: string
    subTratamientoId: string
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tratamiento?: TratamientoUpdateOneRequiredWithoutCitasNestedInput
    subTratamiento?: SubTratamientoUpdateOneRequiredWithoutCitasNestedInput
  }

  export type CitaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    tratamientoId?: StringFieldUpdateOperationsInput | string
    subTratamientoId?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaCreateManyInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    tratamientoId: string
    subTratamientoId: string
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    tratamientoId?: StringFieldUpdateOperationsInput | string
    subTratamientoId?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FechaDisponibleCreateInput = {
    id?: string
    fechaInicio: Date | string
    fechaFin: Date | string
    boxesDisponibles?: FechaDisponibleCreateboxesDisponiblesInput | number[]
    horaInicio?: Date | string
    horaFin?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tratamiento: TratamientoCreateNestedOneWithoutFechasDisponiblesInput
  }

  export type FechaDisponibleUncheckedCreateInput = {
    id?: string
    tratamientoId: string
    fechaInicio: Date | string
    fechaFin: Date | string
    boxesDisponibles?: FechaDisponibleCreateboxesDisponiblesInput | number[]
    horaInicio?: Date | string
    horaFin?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FechaDisponibleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tratamiento?: TratamientoUpdateOneRequiredWithoutFechasDisponiblesNestedInput
  }

  export type FechaDisponibleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tratamientoId?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FechaDisponibleCreateManyInput = {
    id?: string
    tratamientoId: string
    fechaInicio: Date | string
    fechaFin: Date | string
    boxesDisponibles?: FechaDisponibleCreateboxesDisponiblesInput | number[]
    horaInicio?: Date | string
    horaFin?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FechaDisponibleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FechaDisponibleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tratamientoId?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SubTratamientoListRelationFilter = {
    every?: SubTratamientoWhereInput
    some?: SubTratamientoWhereInput
    none?: SubTratamientoWhereInput
  }

  export type CitaListRelationFilter = {
    every?: CitaWhereInput
    some?: CitaWhereInput
    none?: CitaWhereInput
  }

  export type FechaDisponibleListRelationFilter = {
    every?: FechaDisponibleWhereInput
    some?: FechaDisponibleWhereInput
    none?: FechaDisponibleWhereInput
  }

  export type SubTratamientoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CitaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FechaDisponibleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TratamientoCountOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TratamientoMaxOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TratamientoMinOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type TratamientoScalarRelationFilter = {
    is?: TratamientoWhereInput
    isNot?: TratamientoWhereInput
  }

  export type SubTratamientoTratamientoIdNombreCompoundUniqueInput = {
    tratamientoId: string
    nombre: string
  }

  export type SubTratamientoCountOrderByAggregateInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    nombre?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubTratamientoAvgOrderByAggregateInput = {
    duracion?: SortOrder
    precio?: SortOrder
  }

  export type SubTratamientoMaxOrderByAggregateInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    nombre?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubTratamientoMinOrderByAggregateInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    nombre?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubTratamientoSumOrderByAggregateInput = {
    duracion?: SortOrder
    precio?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type SubTratamientoScalarRelationFilter = {
    is?: SubTratamientoWhereInput
    isNot?: SubTratamientoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CitaCountOrderByAggregateInput = {
    id?: SortOrder
    nombreCompleto?: SortOrder
    dni?: SortOrder
    whatsapp?: SortOrder
    fecha?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    boxId?: SortOrder
    tratamientoId?: SortOrder
    subTratamientoId?: SortOrder
    color?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    senia?: SortOrder
    observaciones?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitaAvgOrderByAggregateInput = {
    boxId?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    senia?: SortOrder
  }

  export type CitaMaxOrderByAggregateInput = {
    id?: SortOrder
    nombreCompleto?: SortOrder
    dni?: SortOrder
    whatsapp?: SortOrder
    fecha?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    boxId?: SortOrder
    tratamientoId?: SortOrder
    subTratamientoId?: SortOrder
    color?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    senia?: SortOrder
    observaciones?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitaMinOrderByAggregateInput = {
    id?: SortOrder
    nombreCompleto?: SortOrder
    dni?: SortOrder
    whatsapp?: SortOrder
    fecha?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    boxId?: SortOrder
    tratamientoId?: SortOrder
    subTratamientoId?: SortOrder
    color?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    senia?: SortOrder
    observaciones?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CitaSumOrderByAggregateInput = {
    boxId?: SortOrder
    duracion?: SortOrder
    precio?: SortOrder
    senia?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type IntNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    has?: number | IntFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListIntFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListIntFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type FechaDisponibleCountOrderByAggregateInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    fechaInicio?: SortOrder
    fechaFin?: SortOrder
    boxesDisponibles?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FechaDisponibleAvgOrderByAggregateInput = {
    boxesDisponibles?: SortOrder
  }

  export type FechaDisponibleMaxOrderByAggregateInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    fechaInicio?: SortOrder
    fechaFin?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FechaDisponibleMinOrderByAggregateInput = {
    id?: SortOrder
    tratamientoId?: SortOrder
    fechaInicio?: SortOrder
    fechaFin?: SortOrder
    horaInicio?: SortOrder
    horaFin?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FechaDisponibleSumOrderByAggregateInput = {
    boxesDisponibles?: SortOrder
  }

  export type SubTratamientoCreateNestedManyWithoutTratamientoInput = {
    create?: XOR<SubTratamientoCreateWithoutTratamientoInput, SubTratamientoUncheckedCreateWithoutTratamientoInput> | SubTratamientoCreateWithoutTratamientoInput[] | SubTratamientoUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: SubTratamientoCreateOrConnectWithoutTratamientoInput | SubTratamientoCreateOrConnectWithoutTratamientoInput[]
    createMany?: SubTratamientoCreateManyTratamientoInputEnvelope
    connect?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
  }

  export type CitaCreateNestedManyWithoutTratamientoInput = {
    create?: XOR<CitaCreateWithoutTratamientoInput, CitaUncheckedCreateWithoutTratamientoInput> | CitaCreateWithoutTratamientoInput[] | CitaUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutTratamientoInput | CitaCreateOrConnectWithoutTratamientoInput[]
    createMany?: CitaCreateManyTratamientoInputEnvelope
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
  }

  export type FechaDisponibleCreateNestedManyWithoutTratamientoInput = {
    create?: XOR<FechaDisponibleCreateWithoutTratamientoInput, FechaDisponibleUncheckedCreateWithoutTratamientoInput> | FechaDisponibleCreateWithoutTratamientoInput[] | FechaDisponibleUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: FechaDisponibleCreateOrConnectWithoutTratamientoInput | FechaDisponibleCreateOrConnectWithoutTratamientoInput[]
    createMany?: FechaDisponibleCreateManyTratamientoInputEnvelope
    connect?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
  }

  export type SubTratamientoUncheckedCreateNestedManyWithoutTratamientoInput = {
    create?: XOR<SubTratamientoCreateWithoutTratamientoInput, SubTratamientoUncheckedCreateWithoutTratamientoInput> | SubTratamientoCreateWithoutTratamientoInput[] | SubTratamientoUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: SubTratamientoCreateOrConnectWithoutTratamientoInput | SubTratamientoCreateOrConnectWithoutTratamientoInput[]
    createMany?: SubTratamientoCreateManyTratamientoInputEnvelope
    connect?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
  }

  export type CitaUncheckedCreateNestedManyWithoutTratamientoInput = {
    create?: XOR<CitaCreateWithoutTratamientoInput, CitaUncheckedCreateWithoutTratamientoInput> | CitaCreateWithoutTratamientoInput[] | CitaUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutTratamientoInput | CitaCreateOrConnectWithoutTratamientoInput[]
    createMany?: CitaCreateManyTratamientoInputEnvelope
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
  }

  export type FechaDisponibleUncheckedCreateNestedManyWithoutTratamientoInput = {
    create?: XOR<FechaDisponibleCreateWithoutTratamientoInput, FechaDisponibleUncheckedCreateWithoutTratamientoInput> | FechaDisponibleCreateWithoutTratamientoInput[] | FechaDisponibleUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: FechaDisponibleCreateOrConnectWithoutTratamientoInput | FechaDisponibleCreateOrConnectWithoutTratamientoInput[]
    createMany?: FechaDisponibleCreateManyTratamientoInputEnvelope
    connect?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SubTratamientoUpdateManyWithoutTratamientoNestedInput = {
    create?: XOR<SubTratamientoCreateWithoutTratamientoInput, SubTratamientoUncheckedCreateWithoutTratamientoInput> | SubTratamientoCreateWithoutTratamientoInput[] | SubTratamientoUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: SubTratamientoCreateOrConnectWithoutTratamientoInput | SubTratamientoCreateOrConnectWithoutTratamientoInput[]
    upsert?: SubTratamientoUpsertWithWhereUniqueWithoutTratamientoInput | SubTratamientoUpsertWithWhereUniqueWithoutTratamientoInput[]
    createMany?: SubTratamientoCreateManyTratamientoInputEnvelope
    set?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    disconnect?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    delete?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    connect?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    update?: SubTratamientoUpdateWithWhereUniqueWithoutTratamientoInput | SubTratamientoUpdateWithWhereUniqueWithoutTratamientoInput[]
    updateMany?: SubTratamientoUpdateManyWithWhereWithoutTratamientoInput | SubTratamientoUpdateManyWithWhereWithoutTratamientoInput[]
    deleteMany?: SubTratamientoScalarWhereInput | SubTratamientoScalarWhereInput[]
  }

  export type CitaUpdateManyWithoutTratamientoNestedInput = {
    create?: XOR<CitaCreateWithoutTratamientoInput, CitaUncheckedCreateWithoutTratamientoInput> | CitaCreateWithoutTratamientoInput[] | CitaUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutTratamientoInput | CitaCreateOrConnectWithoutTratamientoInput[]
    upsert?: CitaUpsertWithWhereUniqueWithoutTratamientoInput | CitaUpsertWithWhereUniqueWithoutTratamientoInput[]
    createMany?: CitaCreateManyTratamientoInputEnvelope
    set?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    disconnect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    delete?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    update?: CitaUpdateWithWhereUniqueWithoutTratamientoInput | CitaUpdateWithWhereUniqueWithoutTratamientoInput[]
    updateMany?: CitaUpdateManyWithWhereWithoutTratamientoInput | CitaUpdateManyWithWhereWithoutTratamientoInput[]
    deleteMany?: CitaScalarWhereInput | CitaScalarWhereInput[]
  }

  export type FechaDisponibleUpdateManyWithoutTratamientoNestedInput = {
    create?: XOR<FechaDisponibleCreateWithoutTratamientoInput, FechaDisponibleUncheckedCreateWithoutTratamientoInput> | FechaDisponibleCreateWithoutTratamientoInput[] | FechaDisponibleUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: FechaDisponibleCreateOrConnectWithoutTratamientoInput | FechaDisponibleCreateOrConnectWithoutTratamientoInput[]
    upsert?: FechaDisponibleUpsertWithWhereUniqueWithoutTratamientoInput | FechaDisponibleUpsertWithWhereUniqueWithoutTratamientoInput[]
    createMany?: FechaDisponibleCreateManyTratamientoInputEnvelope
    set?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    disconnect?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    delete?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    connect?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    update?: FechaDisponibleUpdateWithWhereUniqueWithoutTratamientoInput | FechaDisponibleUpdateWithWhereUniqueWithoutTratamientoInput[]
    updateMany?: FechaDisponibleUpdateManyWithWhereWithoutTratamientoInput | FechaDisponibleUpdateManyWithWhereWithoutTratamientoInput[]
    deleteMany?: FechaDisponibleScalarWhereInput | FechaDisponibleScalarWhereInput[]
  }

  export type SubTratamientoUncheckedUpdateManyWithoutTratamientoNestedInput = {
    create?: XOR<SubTratamientoCreateWithoutTratamientoInput, SubTratamientoUncheckedCreateWithoutTratamientoInput> | SubTratamientoCreateWithoutTratamientoInput[] | SubTratamientoUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: SubTratamientoCreateOrConnectWithoutTratamientoInput | SubTratamientoCreateOrConnectWithoutTratamientoInput[]
    upsert?: SubTratamientoUpsertWithWhereUniqueWithoutTratamientoInput | SubTratamientoUpsertWithWhereUniqueWithoutTratamientoInput[]
    createMany?: SubTratamientoCreateManyTratamientoInputEnvelope
    set?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    disconnect?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    delete?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    connect?: SubTratamientoWhereUniqueInput | SubTratamientoWhereUniqueInput[]
    update?: SubTratamientoUpdateWithWhereUniqueWithoutTratamientoInput | SubTratamientoUpdateWithWhereUniqueWithoutTratamientoInput[]
    updateMany?: SubTratamientoUpdateManyWithWhereWithoutTratamientoInput | SubTratamientoUpdateManyWithWhereWithoutTratamientoInput[]
    deleteMany?: SubTratamientoScalarWhereInput | SubTratamientoScalarWhereInput[]
  }

  export type CitaUncheckedUpdateManyWithoutTratamientoNestedInput = {
    create?: XOR<CitaCreateWithoutTratamientoInput, CitaUncheckedCreateWithoutTratamientoInput> | CitaCreateWithoutTratamientoInput[] | CitaUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutTratamientoInput | CitaCreateOrConnectWithoutTratamientoInput[]
    upsert?: CitaUpsertWithWhereUniqueWithoutTratamientoInput | CitaUpsertWithWhereUniqueWithoutTratamientoInput[]
    createMany?: CitaCreateManyTratamientoInputEnvelope
    set?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    disconnect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    delete?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    update?: CitaUpdateWithWhereUniqueWithoutTratamientoInput | CitaUpdateWithWhereUniqueWithoutTratamientoInput[]
    updateMany?: CitaUpdateManyWithWhereWithoutTratamientoInput | CitaUpdateManyWithWhereWithoutTratamientoInput[]
    deleteMany?: CitaScalarWhereInput | CitaScalarWhereInput[]
  }

  export type FechaDisponibleUncheckedUpdateManyWithoutTratamientoNestedInput = {
    create?: XOR<FechaDisponibleCreateWithoutTratamientoInput, FechaDisponibleUncheckedCreateWithoutTratamientoInput> | FechaDisponibleCreateWithoutTratamientoInput[] | FechaDisponibleUncheckedCreateWithoutTratamientoInput[]
    connectOrCreate?: FechaDisponibleCreateOrConnectWithoutTratamientoInput | FechaDisponibleCreateOrConnectWithoutTratamientoInput[]
    upsert?: FechaDisponibleUpsertWithWhereUniqueWithoutTratamientoInput | FechaDisponibleUpsertWithWhereUniqueWithoutTratamientoInput[]
    createMany?: FechaDisponibleCreateManyTratamientoInputEnvelope
    set?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    disconnect?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    delete?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    connect?: FechaDisponibleWhereUniqueInput | FechaDisponibleWhereUniqueInput[]
    update?: FechaDisponibleUpdateWithWhereUniqueWithoutTratamientoInput | FechaDisponibleUpdateWithWhereUniqueWithoutTratamientoInput[]
    updateMany?: FechaDisponibleUpdateManyWithWhereWithoutTratamientoInput | FechaDisponibleUpdateManyWithWhereWithoutTratamientoInput[]
    deleteMany?: FechaDisponibleScalarWhereInput | FechaDisponibleScalarWhereInput[]
  }

  export type TratamientoCreateNestedOneWithoutSubTratamientosInput = {
    create?: XOR<TratamientoCreateWithoutSubTratamientosInput, TratamientoUncheckedCreateWithoutSubTratamientosInput>
    connectOrCreate?: TratamientoCreateOrConnectWithoutSubTratamientosInput
    connect?: TratamientoWhereUniqueInput
  }

  export type CitaCreateNestedManyWithoutSubTratamientoInput = {
    create?: XOR<CitaCreateWithoutSubTratamientoInput, CitaUncheckedCreateWithoutSubTratamientoInput> | CitaCreateWithoutSubTratamientoInput[] | CitaUncheckedCreateWithoutSubTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutSubTratamientoInput | CitaCreateOrConnectWithoutSubTratamientoInput[]
    createMany?: CitaCreateManySubTratamientoInputEnvelope
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
  }

  export type CitaUncheckedCreateNestedManyWithoutSubTratamientoInput = {
    create?: XOR<CitaCreateWithoutSubTratamientoInput, CitaUncheckedCreateWithoutSubTratamientoInput> | CitaCreateWithoutSubTratamientoInput[] | CitaUncheckedCreateWithoutSubTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutSubTratamientoInput | CitaCreateOrConnectWithoutSubTratamientoInput[]
    createMany?: CitaCreateManySubTratamientoInputEnvelope
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type TratamientoUpdateOneRequiredWithoutSubTratamientosNestedInput = {
    create?: XOR<TratamientoCreateWithoutSubTratamientosInput, TratamientoUncheckedCreateWithoutSubTratamientosInput>
    connectOrCreate?: TratamientoCreateOrConnectWithoutSubTratamientosInput
    upsert?: TratamientoUpsertWithoutSubTratamientosInput
    connect?: TratamientoWhereUniqueInput
    update?: XOR<XOR<TratamientoUpdateToOneWithWhereWithoutSubTratamientosInput, TratamientoUpdateWithoutSubTratamientosInput>, TratamientoUncheckedUpdateWithoutSubTratamientosInput>
  }

  export type CitaUpdateManyWithoutSubTratamientoNestedInput = {
    create?: XOR<CitaCreateWithoutSubTratamientoInput, CitaUncheckedCreateWithoutSubTratamientoInput> | CitaCreateWithoutSubTratamientoInput[] | CitaUncheckedCreateWithoutSubTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutSubTratamientoInput | CitaCreateOrConnectWithoutSubTratamientoInput[]
    upsert?: CitaUpsertWithWhereUniqueWithoutSubTratamientoInput | CitaUpsertWithWhereUniqueWithoutSubTratamientoInput[]
    createMany?: CitaCreateManySubTratamientoInputEnvelope
    set?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    disconnect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    delete?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    update?: CitaUpdateWithWhereUniqueWithoutSubTratamientoInput | CitaUpdateWithWhereUniqueWithoutSubTratamientoInput[]
    updateMany?: CitaUpdateManyWithWhereWithoutSubTratamientoInput | CitaUpdateManyWithWhereWithoutSubTratamientoInput[]
    deleteMany?: CitaScalarWhereInput | CitaScalarWhereInput[]
  }

  export type CitaUncheckedUpdateManyWithoutSubTratamientoNestedInput = {
    create?: XOR<CitaCreateWithoutSubTratamientoInput, CitaUncheckedCreateWithoutSubTratamientoInput> | CitaCreateWithoutSubTratamientoInput[] | CitaUncheckedCreateWithoutSubTratamientoInput[]
    connectOrCreate?: CitaCreateOrConnectWithoutSubTratamientoInput | CitaCreateOrConnectWithoutSubTratamientoInput[]
    upsert?: CitaUpsertWithWhereUniqueWithoutSubTratamientoInput | CitaUpsertWithWhereUniqueWithoutSubTratamientoInput[]
    createMany?: CitaCreateManySubTratamientoInputEnvelope
    set?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    disconnect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    delete?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    connect?: CitaWhereUniqueInput | CitaWhereUniqueInput[]
    update?: CitaUpdateWithWhereUniqueWithoutSubTratamientoInput | CitaUpdateWithWhereUniqueWithoutSubTratamientoInput[]
    updateMany?: CitaUpdateManyWithWhereWithoutSubTratamientoInput | CitaUpdateManyWithWhereWithoutSubTratamientoInput[]
    deleteMany?: CitaScalarWhereInput | CitaScalarWhereInput[]
  }

  export type TratamientoCreateNestedOneWithoutCitasInput = {
    create?: XOR<TratamientoCreateWithoutCitasInput, TratamientoUncheckedCreateWithoutCitasInput>
    connectOrCreate?: TratamientoCreateOrConnectWithoutCitasInput
    connect?: TratamientoWhereUniqueInput
  }

  export type SubTratamientoCreateNestedOneWithoutCitasInput = {
    create?: XOR<SubTratamientoCreateWithoutCitasInput, SubTratamientoUncheckedCreateWithoutCitasInput>
    connectOrCreate?: SubTratamientoCreateOrConnectWithoutCitasInput
    connect?: SubTratamientoWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type TratamientoUpdateOneRequiredWithoutCitasNestedInput = {
    create?: XOR<TratamientoCreateWithoutCitasInput, TratamientoUncheckedCreateWithoutCitasInput>
    connectOrCreate?: TratamientoCreateOrConnectWithoutCitasInput
    upsert?: TratamientoUpsertWithoutCitasInput
    connect?: TratamientoWhereUniqueInput
    update?: XOR<XOR<TratamientoUpdateToOneWithWhereWithoutCitasInput, TratamientoUpdateWithoutCitasInput>, TratamientoUncheckedUpdateWithoutCitasInput>
  }

  export type SubTratamientoUpdateOneRequiredWithoutCitasNestedInput = {
    create?: XOR<SubTratamientoCreateWithoutCitasInput, SubTratamientoUncheckedCreateWithoutCitasInput>
    connectOrCreate?: SubTratamientoCreateOrConnectWithoutCitasInput
    upsert?: SubTratamientoUpsertWithoutCitasInput
    connect?: SubTratamientoWhereUniqueInput
    update?: XOR<XOR<SubTratamientoUpdateToOneWithWhereWithoutCitasInput, SubTratamientoUpdateWithoutCitasInput>, SubTratamientoUncheckedUpdateWithoutCitasInput>
  }

  export type FechaDisponibleCreateboxesDisponiblesInput = {
    set: number[]
  }

  export type TratamientoCreateNestedOneWithoutFechasDisponiblesInput = {
    create?: XOR<TratamientoCreateWithoutFechasDisponiblesInput, TratamientoUncheckedCreateWithoutFechasDisponiblesInput>
    connectOrCreate?: TratamientoCreateOrConnectWithoutFechasDisponiblesInput
    connect?: TratamientoWhereUniqueInput
  }

  export type FechaDisponibleUpdateboxesDisponiblesInput = {
    set?: number[]
    push?: number | number[]
  }

  export type TratamientoUpdateOneRequiredWithoutFechasDisponiblesNestedInput = {
    create?: XOR<TratamientoCreateWithoutFechasDisponiblesInput, TratamientoUncheckedCreateWithoutFechasDisponiblesInput>
    connectOrCreate?: TratamientoCreateOrConnectWithoutFechasDisponiblesInput
    upsert?: TratamientoUpsertWithoutFechasDisponiblesInput
    connect?: TratamientoWhereUniqueInput
    update?: XOR<XOR<TratamientoUpdateToOneWithWhereWithoutFechasDisponiblesInput, TratamientoUpdateWithoutFechasDisponiblesInput>, TratamientoUncheckedUpdateWithoutFechasDisponiblesInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type SubTratamientoCreateWithoutTratamientoInput = {
    id?: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    citas?: CitaCreateNestedManyWithoutSubTratamientoInput
  }

  export type SubTratamientoUncheckedCreateWithoutTratamientoInput = {
    id?: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    citas?: CitaUncheckedCreateNestedManyWithoutSubTratamientoInput
  }

  export type SubTratamientoCreateOrConnectWithoutTratamientoInput = {
    where: SubTratamientoWhereUniqueInput
    create: XOR<SubTratamientoCreateWithoutTratamientoInput, SubTratamientoUncheckedCreateWithoutTratamientoInput>
  }

  export type SubTratamientoCreateManyTratamientoInputEnvelope = {
    data: SubTratamientoCreateManyTratamientoInput | SubTratamientoCreateManyTratamientoInput[]
    skipDuplicates?: boolean
  }

  export type CitaCreateWithoutTratamientoInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamiento: SubTratamientoCreateNestedOneWithoutCitasInput
  }

  export type CitaUncheckedCreateWithoutTratamientoInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    subTratamientoId: string
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitaCreateOrConnectWithoutTratamientoInput = {
    where: CitaWhereUniqueInput
    create: XOR<CitaCreateWithoutTratamientoInput, CitaUncheckedCreateWithoutTratamientoInput>
  }

  export type CitaCreateManyTratamientoInputEnvelope = {
    data: CitaCreateManyTratamientoInput | CitaCreateManyTratamientoInput[]
    skipDuplicates?: boolean
  }

  export type FechaDisponibleCreateWithoutTratamientoInput = {
    id?: string
    fechaInicio: Date | string
    fechaFin: Date | string
    boxesDisponibles?: FechaDisponibleCreateboxesDisponiblesInput | number[]
    horaInicio?: Date | string
    horaFin?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FechaDisponibleUncheckedCreateWithoutTratamientoInput = {
    id?: string
    fechaInicio: Date | string
    fechaFin: Date | string
    boxesDisponibles?: FechaDisponibleCreateboxesDisponiblesInput | number[]
    horaInicio?: Date | string
    horaFin?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FechaDisponibleCreateOrConnectWithoutTratamientoInput = {
    where: FechaDisponibleWhereUniqueInput
    create: XOR<FechaDisponibleCreateWithoutTratamientoInput, FechaDisponibleUncheckedCreateWithoutTratamientoInput>
  }

  export type FechaDisponibleCreateManyTratamientoInputEnvelope = {
    data: FechaDisponibleCreateManyTratamientoInput | FechaDisponibleCreateManyTratamientoInput[]
    skipDuplicates?: boolean
  }

  export type SubTratamientoUpsertWithWhereUniqueWithoutTratamientoInput = {
    where: SubTratamientoWhereUniqueInput
    update: XOR<SubTratamientoUpdateWithoutTratamientoInput, SubTratamientoUncheckedUpdateWithoutTratamientoInput>
    create: XOR<SubTratamientoCreateWithoutTratamientoInput, SubTratamientoUncheckedCreateWithoutTratamientoInput>
  }

  export type SubTratamientoUpdateWithWhereUniqueWithoutTratamientoInput = {
    where: SubTratamientoWhereUniqueInput
    data: XOR<SubTratamientoUpdateWithoutTratamientoInput, SubTratamientoUncheckedUpdateWithoutTratamientoInput>
  }

  export type SubTratamientoUpdateManyWithWhereWithoutTratamientoInput = {
    where: SubTratamientoScalarWhereInput
    data: XOR<SubTratamientoUpdateManyMutationInput, SubTratamientoUncheckedUpdateManyWithoutTratamientoInput>
  }

  export type SubTratamientoScalarWhereInput = {
    AND?: SubTratamientoScalarWhereInput | SubTratamientoScalarWhereInput[]
    OR?: SubTratamientoScalarWhereInput[]
    NOT?: SubTratamientoScalarWhereInput | SubTratamientoScalarWhereInput[]
    id?: UuidFilter<"SubTratamiento"> | string
    tratamientoId?: UuidFilter<"SubTratamiento"> | string
    nombre?: StringFilter<"SubTratamiento"> | string
    duracion?: IntFilter<"SubTratamiento"> | number
    precio?: DecimalFilter<"SubTratamiento"> | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFilter<"SubTratamiento"> | Date | string
    updatedAt?: DateTimeFilter<"SubTratamiento"> | Date | string
  }

  export type CitaUpsertWithWhereUniqueWithoutTratamientoInput = {
    where: CitaWhereUniqueInput
    update: XOR<CitaUpdateWithoutTratamientoInput, CitaUncheckedUpdateWithoutTratamientoInput>
    create: XOR<CitaCreateWithoutTratamientoInput, CitaUncheckedCreateWithoutTratamientoInput>
  }

  export type CitaUpdateWithWhereUniqueWithoutTratamientoInput = {
    where: CitaWhereUniqueInput
    data: XOR<CitaUpdateWithoutTratamientoInput, CitaUncheckedUpdateWithoutTratamientoInput>
  }

  export type CitaUpdateManyWithWhereWithoutTratamientoInput = {
    where: CitaScalarWhereInput
    data: XOR<CitaUpdateManyMutationInput, CitaUncheckedUpdateManyWithoutTratamientoInput>
  }

  export type CitaScalarWhereInput = {
    AND?: CitaScalarWhereInput | CitaScalarWhereInput[]
    OR?: CitaScalarWhereInput[]
    NOT?: CitaScalarWhereInput | CitaScalarWhereInput[]
    id?: UuidFilter<"Cita"> | string
    nombreCompleto?: StringFilter<"Cita"> | string
    dni?: StringNullableFilter<"Cita"> | string | null
    whatsapp?: StringNullableFilter<"Cita"> | string | null
    fecha?: DateTimeFilter<"Cita"> | Date | string
    horaInicio?: DateTimeFilter<"Cita"> | Date | string
    horaFin?: DateTimeFilter<"Cita"> | Date | string
    boxId?: IntFilter<"Cita"> | number
    tratamientoId?: UuidFilter<"Cita"> | string
    subTratamientoId?: UuidFilter<"Cita"> | string
    color?: StringFilter<"Cita"> | string
    duracion?: IntNullableFilter<"Cita"> | number | null
    precio?: DecimalNullableFilter<"Cita"> | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFilter<"Cita"> | Decimal | DecimalJsLike | number | string
    observaciones?: StringNullableFilter<"Cita"> | string | null
    createdAt?: DateTimeFilter<"Cita"> | Date | string
    updatedAt?: DateTimeFilter<"Cita"> | Date | string
  }

  export type FechaDisponibleUpsertWithWhereUniqueWithoutTratamientoInput = {
    where: FechaDisponibleWhereUniqueInput
    update: XOR<FechaDisponibleUpdateWithoutTratamientoInput, FechaDisponibleUncheckedUpdateWithoutTratamientoInput>
    create: XOR<FechaDisponibleCreateWithoutTratamientoInput, FechaDisponibleUncheckedCreateWithoutTratamientoInput>
  }

  export type FechaDisponibleUpdateWithWhereUniqueWithoutTratamientoInput = {
    where: FechaDisponibleWhereUniqueInput
    data: XOR<FechaDisponibleUpdateWithoutTratamientoInput, FechaDisponibleUncheckedUpdateWithoutTratamientoInput>
  }

  export type FechaDisponibleUpdateManyWithWhereWithoutTratamientoInput = {
    where: FechaDisponibleScalarWhereInput
    data: XOR<FechaDisponibleUpdateManyMutationInput, FechaDisponibleUncheckedUpdateManyWithoutTratamientoInput>
  }

  export type FechaDisponibleScalarWhereInput = {
    AND?: FechaDisponibleScalarWhereInput | FechaDisponibleScalarWhereInput[]
    OR?: FechaDisponibleScalarWhereInput[]
    NOT?: FechaDisponibleScalarWhereInput | FechaDisponibleScalarWhereInput[]
    id?: UuidFilter<"FechaDisponible"> | string
    tratamientoId?: UuidFilter<"FechaDisponible"> | string
    fechaInicio?: DateTimeFilter<"FechaDisponible"> | Date | string
    fechaFin?: DateTimeFilter<"FechaDisponible"> | Date | string
    boxesDisponibles?: IntNullableListFilter<"FechaDisponible">
    horaInicio?: DateTimeFilter<"FechaDisponible"> | Date | string
    horaFin?: DateTimeFilter<"FechaDisponible"> | Date | string
    createdAt?: DateTimeFilter<"FechaDisponible"> | Date | string
    updatedAt?: DateTimeFilter<"FechaDisponible"> | Date | string
  }

  export type TratamientoCreateWithoutSubTratamientosInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    citas?: CitaCreateNestedManyWithoutTratamientoInput
    fechasDisponibles?: FechaDisponibleCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoUncheckedCreateWithoutSubTratamientosInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    citas?: CitaUncheckedCreateNestedManyWithoutTratamientoInput
    fechasDisponibles?: FechaDisponibleUncheckedCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoCreateOrConnectWithoutSubTratamientosInput = {
    where: TratamientoWhereUniqueInput
    create: XOR<TratamientoCreateWithoutSubTratamientosInput, TratamientoUncheckedCreateWithoutSubTratamientosInput>
  }

  export type CitaCreateWithoutSubTratamientoInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tratamiento: TratamientoCreateNestedOneWithoutCitasInput
  }

  export type CitaUncheckedCreateWithoutSubTratamientoInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    tratamientoId: string
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitaCreateOrConnectWithoutSubTratamientoInput = {
    where: CitaWhereUniqueInput
    create: XOR<CitaCreateWithoutSubTratamientoInput, CitaUncheckedCreateWithoutSubTratamientoInput>
  }

  export type CitaCreateManySubTratamientoInputEnvelope = {
    data: CitaCreateManySubTratamientoInput | CitaCreateManySubTratamientoInput[]
    skipDuplicates?: boolean
  }

  export type TratamientoUpsertWithoutSubTratamientosInput = {
    update: XOR<TratamientoUpdateWithoutSubTratamientosInput, TratamientoUncheckedUpdateWithoutSubTratamientosInput>
    create: XOR<TratamientoCreateWithoutSubTratamientosInput, TratamientoUncheckedCreateWithoutSubTratamientosInput>
    where?: TratamientoWhereInput
  }

  export type TratamientoUpdateToOneWithWhereWithoutSubTratamientosInput = {
    where?: TratamientoWhereInput
    data: XOR<TratamientoUpdateWithoutSubTratamientosInput, TratamientoUncheckedUpdateWithoutSubTratamientosInput>
  }

  export type TratamientoUpdateWithoutSubTratamientosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citas?: CitaUpdateManyWithoutTratamientoNestedInput
    fechasDisponibles?: FechaDisponibleUpdateManyWithoutTratamientoNestedInput
  }

  export type TratamientoUncheckedUpdateWithoutSubTratamientosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citas?: CitaUncheckedUpdateManyWithoutTratamientoNestedInput
    fechasDisponibles?: FechaDisponibleUncheckedUpdateManyWithoutTratamientoNestedInput
  }

  export type CitaUpsertWithWhereUniqueWithoutSubTratamientoInput = {
    where: CitaWhereUniqueInput
    update: XOR<CitaUpdateWithoutSubTratamientoInput, CitaUncheckedUpdateWithoutSubTratamientoInput>
    create: XOR<CitaCreateWithoutSubTratamientoInput, CitaUncheckedCreateWithoutSubTratamientoInput>
  }

  export type CitaUpdateWithWhereUniqueWithoutSubTratamientoInput = {
    where: CitaWhereUniqueInput
    data: XOR<CitaUpdateWithoutSubTratamientoInput, CitaUncheckedUpdateWithoutSubTratamientoInput>
  }

  export type CitaUpdateManyWithWhereWithoutSubTratamientoInput = {
    where: CitaScalarWhereInput
    data: XOR<CitaUpdateManyMutationInput, CitaUncheckedUpdateManyWithoutSubTratamientoInput>
  }

  export type TratamientoCreateWithoutCitasInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamientos?: SubTratamientoCreateNestedManyWithoutTratamientoInput
    fechasDisponibles?: FechaDisponibleCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoUncheckedCreateWithoutCitasInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamientos?: SubTratamientoUncheckedCreateNestedManyWithoutTratamientoInput
    fechasDisponibles?: FechaDisponibleUncheckedCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoCreateOrConnectWithoutCitasInput = {
    where: TratamientoWhereUniqueInput
    create: XOR<TratamientoCreateWithoutCitasInput, TratamientoUncheckedCreateWithoutCitasInput>
  }

  export type SubTratamientoCreateWithoutCitasInput = {
    id?: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
    tratamiento: TratamientoCreateNestedOneWithoutSubTratamientosInput
  }

  export type SubTratamientoUncheckedCreateWithoutCitasInput = {
    id?: string
    tratamientoId: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubTratamientoCreateOrConnectWithoutCitasInput = {
    where: SubTratamientoWhereUniqueInput
    create: XOR<SubTratamientoCreateWithoutCitasInput, SubTratamientoUncheckedCreateWithoutCitasInput>
  }

  export type TratamientoUpsertWithoutCitasInput = {
    update: XOR<TratamientoUpdateWithoutCitasInput, TratamientoUncheckedUpdateWithoutCitasInput>
    create: XOR<TratamientoCreateWithoutCitasInput, TratamientoUncheckedCreateWithoutCitasInput>
    where?: TratamientoWhereInput
  }

  export type TratamientoUpdateToOneWithWhereWithoutCitasInput = {
    where?: TratamientoWhereInput
    data: XOR<TratamientoUpdateWithoutCitasInput, TratamientoUncheckedUpdateWithoutCitasInput>
  }

  export type TratamientoUpdateWithoutCitasInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamientos?: SubTratamientoUpdateManyWithoutTratamientoNestedInput
    fechasDisponibles?: FechaDisponibleUpdateManyWithoutTratamientoNestedInput
  }

  export type TratamientoUncheckedUpdateWithoutCitasInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamientos?: SubTratamientoUncheckedUpdateManyWithoutTratamientoNestedInput
    fechasDisponibles?: FechaDisponibleUncheckedUpdateManyWithoutTratamientoNestedInput
  }

  export type SubTratamientoUpsertWithoutCitasInput = {
    update: XOR<SubTratamientoUpdateWithoutCitasInput, SubTratamientoUncheckedUpdateWithoutCitasInput>
    create: XOR<SubTratamientoCreateWithoutCitasInput, SubTratamientoUncheckedCreateWithoutCitasInput>
    where?: SubTratamientoWhereInput
  }

  export type SubTratamientoUpdateToOneWithWhereWithoutCitasInput = {
    where?: SubTratamientoWhereInput
    data: XOR<SubTratamientoUpdateWithoutCitasInput, SubTratamientoUncheckedUpdateWithoutCitasInput>
  }

  export type SubTratamientoUpdateWithoutCitasInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tratamiento?: TratamientoUpdateOneRequiredWithoutSubTratamientosNestedInput
  }

  export type SubTratamientoUncheckedUpdateWithoutCitasInput = {
    id?: StringFieldUpdateOperationsInput | string
    tratamientoId?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TratamientoCreateWithoutFechasDisponiblesInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamientos?: SubTratamientoCreateNestedManyWithoutTratamientoInput
    citas?: CitaCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoUncheckedCreateWithoutFechasDisponiblesInput = {
    id?: string
    nombre: string
    createdAt?: Date | string
    updatedAt?: Date | string
    subTratamientos?: SubTratamientoUncheckedCreateNestedManyWithoutTratamientoInput
    citas?: CitaUncheckedCreateNestedManyWithoutTratamientoInput
  }

  export type TratamientoCreateOrConnectWithoutFechasDisponiblesInput = {
    where: TratamientoWhereUniqueInput
    create: XOR<TratamientoCreateWithoutFechasDisponiblesInput, TratamientoUncheckedCreateWithoutFechasDisponiblesInput>
  }

  export type TratamientoUpsertWithoutFechasDisponiblesInput = {
    update: XOR<TratamientoUpdateWithoutFechasDisponiblesInput, TratamientoUncheckedUpdateWithoutFechasDisponiblesInput>
    create: XOR<TratamientoCreateWithoutFechasDisponiblesInput, TratamientoUncheckedCreateWithoutFechasDisponiblesInput>
    where?: TratamientoWhereInput
  }

  export type TratamientoUpdateToOneWithWhereWithoutFechasDisponiblesInput = {
    where?: TratamientoWhereInput
    data: XOR<TratamientoUpdateWithoutFechasDisponiblesInput, TratamientoUncheckedUpdateWithoutFechasDisponiblesInput>
  }

  export type TratamientoUpdateWithoutFechasDisponiblesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamientos?: SubTratamientoUpdateManyWithoutTratamientoNestedInput
    citas?: CitaUpdateManyWithoutTratamientoNestedInput
  }

  export type TratamientoUncheckedUpdateWithoutFechasDisponiblesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamientos?: SubTratamientoUncheckedUpdateManyWithoutTratamientoNestedInput
    citas?: CitaUncheckedUpdateManyWithoutTratamientoNestedInput
  }

  export type SubTratamientoCreateManyTratamientoInput = {
    id?: string
    nombre: string
    duracion: number
    precio: Decimal | DecimalJsLike | number | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitaCreateManyTratamientoInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    subTratamientoId: string
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FechaDisponibleCreateManyTratamientoInput = {
    id?: string
    fechaInicio: Date | string
    fechaFin: Date | string
    boxesDisponibles?: FechaDisponibleCreateboxesDisponiblesInput | number[]
    horaInicio?: Date | string
    horaFin?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SubTratamientoUpdateWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citas?: CitaUpdateManyWithoutSubTratamientoNestedInput
  }

  export type SubTratamientoUncheckedUpdateWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    citas?: CitaUncheckedUpdateManyWithoutSubTratamientoNestedInput
  }

  export type SubTratamientoUncheckedUpdateManyWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    duracion?: IntFieldUpdateOperationsInput | number
    precio?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaUpdateWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subTratamiento?: SubTratamientoUpdateOneRequiredWithoutCitasNestedInput
  }

  export type CitaUncheckedUpdateWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    subTratamientoId?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaUncheckedUpdateManyWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    subTratamientoId?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FechaDisponibleUpdateWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FechaDisponibleUncheckedUpdateWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FechaDisponibleUncheckedUpdateManyWithoutTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxesDisponibles?: FechaDisponibleUpdateboxesDisponiblesInput | number[]
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaCreateManySubTratamientoInput = {
    id?: string
    nombreCompleto: string
    dni?: string | null
    whatsapp?: string | null
    fecha: Date | string
    horaInicio: Date | string
    horaFin: Date | string
    boxId: number
    tratamientoId: string
    color?: string
    duracion?: number | null
    precio?: Decimal | DecimalJsLike | number | string | null
    senia?: Decimal | DecimalJsLike | number | string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CitaUpdateWithoutSubTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tratamiento?: TratamientoUpdateOneRequiredWithoutCitasNestedInput
  }

  export type CitaUncheckedUpdateWithoutSubTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    tratamientoId?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CitaUncheckedUpdateManyWithoutSubTratamientoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreCompleto?: StringFieldUpdateOperationsInput | string
    dni?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    horaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    horaFin?: DateTimeFieldUpdateOperationsInput | Date | string
    boxId?: IntFieldUpdateOperationsInput | number
    tratamientoId?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    duracion?: NullableIntFieldUpdateOperationsInput | number | null
    precio?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    senia?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}