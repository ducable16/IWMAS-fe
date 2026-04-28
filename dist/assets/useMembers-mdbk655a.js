import{c as a}from"./index-CT_A8h6o.js";import{u as t}from"./useQuery-C2orpCmD.js";import{u as o}from"./memberService-g4zsVzqQ.js";/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=a("ArrowDown",[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]);/**
 * @license lucide-react v0.309.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=a("ArrowUp",[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]);function d(){return t({queryKey:["members"],queryFn:async()=>{const r=(await o.getAll()).data??{};return(Array.isArray(r)?r:Array.isArray(r.content)?r.content:[]).map(s)},staleTime:3e4})}function s(e){return{id:e.id,fullName:e.fullName||e.name||e.email,email:e.email,phone:e.phone||"",position:e.position||"",role:e.role||"TEAM_MEMBER",status:e.active===!1?"DISABLED":"ACTIVE",lastActive:e.lastLoginAt||null,createdAt:e.createdAt||null,verified:e.verified??null,avatarUrl:e.avatarUrl||null,workloadScore:e.workloadScore??0}}export{c as A,A as a,d as u};
