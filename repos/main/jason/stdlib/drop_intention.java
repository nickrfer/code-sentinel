//----------------------------------------------------------------------------
// Copyright (C) 2003  Rafael H. Bordini, Jomi F. Hubner, et al.
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
// 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
// 
// To contact the authors:
// http://www.inf.ufrgs.br/~bordini
// http://www.das.ufsc.br/~jomi
//
//----------------------------------------------------------------------------


package jason.stdlib;

import java.util.Iterator;

import jason.JasonException;
import jason.asSemantics.ActionExec;
import jason.asSemantics.Circumstance;
import jason.asSemantics.DefaultInternalAction;
import jason.asSemantics.Event;
import jason.asSemantics.Intention;
import jason.asSemantics.TransitionSystem;
import jason.asSemantics.Unifier;
import jason.asSyntax.Literal;
import jason.asSyntax.Term;
import jason.asSyntax.Trigger;
import jason.asSyntax.Trigger.TEOperator;
import jason.asSyntax.Trigger.TEType;

/**
  <p>Internal action: <b><code>.drop_intention(<i>I</i>)</code></b>.
  
  <p>Description: removes intentions <i>I</i> from the set of
  intentions of the agent (suspended intentions are also considered).
  No event is produced.

  <p>Example:<ul> 

  <li> <code>.drop_intention(go(1,3))</code>: removes an intention having a plan
   with triggering event
  <code>+!go(1,3)</code> in the agent's current circumstance.

  </ul>

  @see jason.stdlib.intend
  @see jason.stdlib.desire
  @see jason.stdlib.drop_all_desires
  @see jason.stdlib.drop_all_events
  @see jason.stdlib.drop_all_intentions
  @see jason.stdlib.drop_desire
  @see jason.stdlib.succeed_goal
  @see jason.stdlib.fail_goal
  @see jason.stdlib.current_intention
  @see jason.stdlib.suspend
  @see jason.stdlib.suspended
  @see jason.stdlib.resume

 */
public class drop_intention extends DefaultInternalAction {
    
    @Override public int getMinArgs() { return 1; }
    @Override public int getMaxArgs() { return 1; }
    
    @Override protected void checkArguments(Term[] args) throws JasonException {
        super.checkArguments(args); // check number of arguments
        if (!args[0].isLiteral() && !args[0].isVar())
            throw JasonException.createWrongArgument(this,"first argument '"+args[0]+"' must be a literal or variable");
    }

    @Override
    public Object execute(TransitionSystem ts, Unifier un, Term[] args) throws Exception {
        checkArguments(args);
        dropInt(ts.getC(),(Literal)args[0],un);
        return true;
    }
    
    public static void dropInt(Circumstance C, Literal l, Unifier un) {
        Unifier bak = un.clone();
        
        Trigger g = new Trigger(TEOperator.add, TEType.achieve, l);
        
        // intention may be suspended in E or PE
        Iterator<Event> ie = C.getEventsPlusAtomic();
        while (ie.hasNext()) {
            Event e = ie.next();
            Intention i = e.getIntention();
            if (i != null && i.hasTrigger(g, un)) {
                C.removeEvent(e);
                un = bak.clone();
            }
        }
        for (String k: C.getPendingEvents().keySet()) {
            Intention i = C.getPendingEvents().get(k).getIntention();
            if (i != null && i.hasTrigger(g, un)) {
                C.removePendingEvent(k);
                un = bak.clone();
            }
        }
        
        // intention may be suspended in PA! (in the new semantics)
        for (ActionExec a: C.getPendingActions().values()) {
            Intention i = a.getIntention();
            if (i.hasTrigger(g, un)) {
                C.dropPendingAction(i);
                un = bak.clone();
            }
        }
    
        Iterator<Intention> itint = C.getIntentionsPlusAtomic();
        while (itint.hasNext()) {
            Intention i = itint.next();
            if (i.hasTrigger(g, un)) {
                C.dropIntention(i);
                un = bak.clone();
            }
        }
            
        // intention may be suspended in PI! (in the new semantics)
        for (Intention i: C.getPendingIntentions().values()) {
            if (i.hasTrigger(g, un)) {
                C.dropPendingIntention(i);
                un = bak.clone();
            }
        }
    }

    public static void dropInt(Circumstance C, Intention del) {
        
        // intention may be suspended in E or PE
        Iterator<Event> ie = C.getEventsPlusAtomic();
        while (ie.hasNext()) {
            Event e = ie.next();
            Intention i = e.getIntention();
            if (i != null && i.equals(del)) {
                C.removeEvent(e);
            }
        }
        for (String k: C.getPendingEvents().keySet()) {
            Intention i = C.getPendingEvents().get(k).getIntention();
            if (i != null && i.equals(del)) {
                C.removePendingEvent(k);
            }
        }
        
        // intention may be suspended in PA! (in the new semantics)
        C.dropPendingAction(del);
        C.dropIntention(del);
            
        // intention may be suspended in PI! (in the new semantics)
        C.dropPendingIntention(del);
    }

}
