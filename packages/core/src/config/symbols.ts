import type { ComputedRef, InjectionKey } from 'vue'

export type CrudDateUnit = 'ms' | 's'

export interface CrudDateDisplayFormat {
  /**
   * 对应 field.type = 'date'
   */
  date?: string
  /**
   * 对应 field.type = 'datetime'
   */
  datetime?: string
  /**
   * 对应 field.type = 'dateRange'
   */
  dateRange?: string
  /**
   * 对应 field.type = 'datetimeRange'
   */
  datetimeRange?: string
}

export interface CrudDateConfig {
  /**
   * 日期字段值类型
   * - timestamp：number（可通过 unit 指定 ms/s）
   * - string：string（遵循具体 UI 组件的默认 value / formattedValue 格式）
   *
   * 说明：该配置仅决定“回传（v-model）”的值格式，不影响控件展示。
   */
  valueType: 'timestamp' | 'string'
  /**
   * timestamp 单位
   * - ms：毫秒（默认，与 JS Date / Naive NDatePicker 一致）
   * - s：秒
   */
  unit: CrudDateUnit
  /**
   * 日期控件展示格式（UI 层消费，例如 Naive NDatePicker 的 format）
   * - string：所有 date 类统一使用
   * - object：按 field.type 分别配置
   *
   * 说明：该配置只影响“展示”，与 valueType 无关。
   */
  displayFormat?: string | CrudDateDisplayFormat
}

export interface CrudConfig {
  date: CrudDateConfig
}

export interface CrudConfigPatch {
  date?: Partial<CrudDateConfig>
}

export const defaultCrudConfig: CrudConfig = {
  date: {
    valueType: 'timestamp',
    unit: 'ms',
    displayFormat: {
      date: 'yyyy-MM-dd',
      datetime: 'yyyy-MM-dd HH:mm:ss',
      dateRange: 'yyyy-MM-dd',
      datetimeRange: 'yyyy-MM-dd HH:mm:ss',
    },
  },
}

export const CrudConfigSymbol: InjectionKey<ComputedRef<CrudConfig>> = Symbol('fcurd:config')
