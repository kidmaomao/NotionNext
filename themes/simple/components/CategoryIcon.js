import CalendarIcon from 'remixicon-react/CalendarLineIcon'
import CompassIcon from 'remixicon-react/Compass3LineIcon'
import FeatherIcon from 'remixicon-react/QuillPenLineIcon'
import FolderIcon from 'remixicon-react/Folder2LineIcon'
import ShoppingBagIcon from 'remixicon-react/ShoppingBagLineIcon'
import SignalIcon from 'remixicon-react/SignalTowerLineIcon'
import StackIcon from 'remixicon-react/StackLineIcon'
import AllIcon from 'remixicon-react/MenuLineIcon'
import ChatIcon from 'remixicon-react/Chat3LineIcon'
import ShieldIcon from 'remixicon-react/ShieldCheckLineIcon'

const categoryIcons = new Map([
  ['情报', [SignalIcon, '#a183d2']],
  ['汇总', [StackIcon, '#73aa80']],
  ['心得', [FeatherIcon, '#c97e99']],
  ['攻略', [CompassIcon, '#72aadd']],
  ['活动', [CalendarIcon, '#c89c50']],
  ['消费', [ShoppingBagIcon, '#d68b68']],
  ['辟谣', [ShieldIcon, '#71a5a0']],
  ['说说', [ChatIcon, '#b585ad']],
  ['所有', [AllIcon, '#74a4be']]
])

export function categoryAppearance(name) {
  return categoryIcons.get(name) ?? [FolderIcon, '#7ca4be']
}
