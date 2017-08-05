package jason.jeditplugin;

import java.io.File;

import javax.swing.JOptionPane;

import org.gjt.sp.jedit.Buffer;
import org.gjt.sp.jedit.View;

import jason.infra.centralised.StartNewAgentGUI;
import jason.mas2j.AgentParameters;
import jason.mas2j.MAS2JProject;
import jason.util.Config;

public class NewAgentGUI extends StartNewAgentGUI {

    private static final long serialVersionUID = 1L;

    Buffer buffer = null;

    View   view;

    public NewAgentGUI(String title, Buffer b, View view, String openDir) {
        super(view, title, openDir);
        buffer = b;
        this.view = view;
    }

    protected boolean ok() {
        AgentParameters agDecl = getAgDecl();
        if (agDecl == null) {
            JOptionPane.showMessageDialog(this, "An agent name must be informed.");
            return false;
        }
        if (agDecl.asSource == null) {
            agDecl.asSource = new File(buffer.getDirectory() + agDecl.name + "." + MAS2JProject.AS_EXT);
        }
        try {
            buffer.writeLock();
            String proj = buffer.getText(0, buffer.getLength());
            int pos = buffer.getLength();
            if (proj.lastIndexOf("directives") > 0) {
                pos = proj.lastIndexOf("directives");
            } else if (proj.lastIndexOf("classpath") > 0) {
                pos = proj.lastIndexOf("classpath");
            } else if (proj.lastIndexOf("}") > 0) {
                pos = proj.lastIndexOf("}");
            }
            pos--;
            buffer.insert(pos, "\n        " + agDecl.getAsInMASProject()+"\n");
        } finally {
            buffer.writeUnlock();
        }

        boolean newFile = !agDecl.asSource.exists();
        Buffer nb = org.gjt.sp.jedit.jEdit.openFile(view, agDecl.asSource.getAbsolutePath());
        if (newFile) {
            try {
                String agcode = Config.get().getTemplate("agent");
                agcode = agcode.replace("<AG_NAME>",agName.getText());
                agcode = agcode.replace("<PROJECT_NAME>", buffer.getName());
                nb.writeLock();
                nb.insert(0, agcode);
                nb.save(view, agDecl.asSource.getAbsolutePath());
            } finally {
                nb.writeUnlock();
            }
        }
        return true;
    }

}
