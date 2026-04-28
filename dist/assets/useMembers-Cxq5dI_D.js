import{c as t}from"./index-PkqP32Kc.js";import{u as a}from"./useQuery-CJVW9ZHm.js";import{u as o}from"./memberService-DLsSfOSQ.js";/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=t("ArrowDown",[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=t("ArrowUp",[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]);function p(){return a({queryKey:["members"],queryFn:async()=>{var r;const e=await o.getAll();return(Array.isArray(e.data)?e.data:((r=e.data)==null?void 0:r.items)||[]).map(s)},staleTime:3e4})}function s(e){return{id:e.id,fullName:e.fullName||e.name||e.email,email:e.email,phone:e.phone||"",position:e.position||e.title||"",role:e.role||"TEAM_MEMBER",status:e.status||(e.active===!1?"DISABLED":"ACTIVE"),lastActive:e.lastActive||e.lastLogin||null,createdAt:e.createdAt||null,workloadScore:e.workloadScore??0}}export{c as A,d as a,p as u};
